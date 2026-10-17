-- =====================================================================
-- EduAI Pro — 0003 triggers + RPCs
-- Public signup always yields role='student'. Privilege changes are audited.
-- =====================================================================

-- ---- New auth user -> student profile -------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    'student',                                        -- forced: never trust client metadata
    nullif(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- Guard profile privilege escalation -----------------------------
create or replace function public.protect_profile()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null for service-role / server-side calls: allow.
  if auth.uid() is not null and new.role is distinct from old.role and not public.is_admin() then
    raise exception 'role change not permitted';
  end if;

  -- Students can never flip onboarding_complete directly; only complete_onboarding() RPC,
  -- the admin, or the service role may.
  if auth.uid() is not null
     and new.onboarding_complete is distinct from old.onboarding_complete
     and not public.is_admin()
     and coalesce(current_setting('eduai.onboarding', true), 'off') <> 'on' then
    raise exception 'onboarding_complete is server-controlled';
  end if;

  if lower(new.email::text) is distinct from lower(old.email::text) and not public.is_admin() then
    raise exception 'email change not permitted here';
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_protect_profile on public.profiles;
create trigger trg_protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile();

-- ---- Audit role / status changes ------------------------------------
create or replace function public.audit_profile_change()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role or new.status is distinct from old.status then
    insert into public.audit_log (actor_id, actor_email, action, target_type, target_id, before, after)
    values (
      auth.uid(),
      (select email from public.profiles where id = auth.uid()),
      case when new.role is distinct from old.role then 'role_change' else 'status_change' end,
      'profile',
      new.id::text,
      jsonb_build_object('role', old.role, 'status', old.status),
      jsonb_build_object('role', new.role, 'status', new.status)
    );
  end if;
  return new;
end $$;

drop trigger if exists trg_audit_profile on public.profiles;
create trigger trg_audit_profile
  after update on public.profiles
  for each row execute function public.audit_profile_change();

-- ---- Generic updated_at ---------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_touch_courses on public.courses;
create trigger trg_touch_courses
  before update on public.courses
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_touch_progress on public.progress;
create trigger trg_touch_progress
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ---- Normalise device_summary (strip anything that looks like an IP) --
create or replace function public.sanitize_device_summary()
returns trigger language plpgsql as $$
declare d text;
begin
  d := coalesce(new.device_summary, '');
  -- Defensive: never persist a raw IP even if a client tries to inject one.
  d := regexp_replace(d, '[0-9]{1,3}(\.[0-9]{1,3}){3}', '[redacted]', 'g');
  d := regexp_replace(d, '([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}', '[redacted]', 'g');
  new.device_summary := left(d, 200);
  return new;
end $$;

drop trigger if exists trg_sanitize_device on public.activity_events;
create trigger trg_sanitize_device
  before insert on public.activity_events
  for each row execute function public.sanitize_device_summary();

drop trigger if exists trg_sanitize_device_sessions on public.sessions;
create trigger trg_sanitize_device_sessions
  before insert on public.sessions
  for each row execute function public.sanitize_device_summary();

-- ---- Complete onboarding (server-validated) -------------------------
create or replace function public.complete_onboarding()
returns public.profiles
language plpgsql security definer set search_path = public as $$
declare
  p public.profiles;
  n_fields int;
  n_subjects int;
begin
  select * into p from public.profiles where id = auth.uid() for update;
  if p.id is null then raise exception 'no profile'; end if;

  if coalesce(btrim(p.full_name), '') = '' then raise exception 'full name required'; end if;
  if p.age is null then raise exception 'age required'; end if;
  if p.mobile_e164 is null then raise exception 'mobile required'; end if;
  if p.college_id is null then raise exception 'college required'; end if;

  select count(*) into n_fields   from public.student_fields   where student_id = p.id;
  select count(*) into n_subjects from public.student_subjects where student_id = p.id;
  if n_fields = 0 and n_subjects = 0 then raise exception 'select at least one field or subject'; end if;

  -- Guardian consent gate: required while the under-18 policy is enabled.
  if p.age < 18 and coalesce((select (value->>'require_guardian_consent')::boolean
                              from public.app_config where key = 'signup'), true)
     and not p.guardian_consent then
    raise exception 'guardian consent required';
  end if;

  perform set_config('eduai.onboarding', 'on', true);
  update public.profiles
     set onboarding_complete = true, onboarding_step = 5, updated_at = now()
   where id = p.id
   returning * into p;

  insert into public.activity_events (user_id, email, role, event_type, entity_type, entity_id)
  values (p.id, p.email, p.role, 'onboarding_complete', 'profile', p.id::text);

  return p;
end $$;

revoke all on function public.complete_onboarding() from public, anon;
grant execute on function public.complete_onboarding() to authenticated;

-- ---- Resume lookup --------------------------------------------------
create or replace function public.get_resume_state()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
    select pr.course_id, c.title as course_title, pr.lesson_id, l.title as lesson_title,
           pr.last_item_type, pr.last_item_id, pr.last_state, pr.updated_at
      from public.progress pr
      left join public.courses c on c.id = pr.course_id
      left join public.lessons l on l.id = pr.lesson_id
     where pr.student_id = auth.uid()
     order by pr.updated_at desc
     limit 5
  ) r;
$$;

grant execute on function public.get_resume_state() to authenticated;
