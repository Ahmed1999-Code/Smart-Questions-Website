-- =====================================================================
-- EduAI Pro — 0002 RLS: helper functions + row-level security
-- Authorization lives HERE and in Edge Functions — never in the browser.
-- =====================================================================

-- ---- Helpers (SECURITY DEFINER so they can read profiles safely) -----
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function public.is_instructor()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'instructor');
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','instructor'));
$$;

-- Does the current instructor own the given course?
create or replace function public.owns_course(cid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses c where c.id = cid and c.instructor_id = auth.uid());
$$;

-- Is the given student enrolled in any course owned by the current instructor?
create or replace function public.instructor_has_student(sid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.student_id = sid and c.instructor_id = auth.uid()
  );
$$;

-- Is the current student enrolled in the given course?
create or replace function public.is_enrolled(cid uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.enrollments e where e.course_id = cid and e.student_id = auth.uid());
$$;

-- ---- Enable RLS everywhere ------------------------------------------
alter table public.profiles           enable row level security;
alter table public.colleges           enable row level security;
alter table public.fields             enable row level security;
alter table public.subjects           enable row level security;
alter table public.college_fields     enable row level security;
alter table public.student_fields     enable row level security;
alter table public.student_subjects   enable row level security;
alter table public.courses            enable row level security;
alter table public.lessons            enable row level security;
alter table public.questions          enable row level security;
alter table public.exams              enable row level security;
alter table public.enrollments        enable row level security;
alter table public.progress           enable row level security;
alter table public.quiz_attempts      enable row level security;
alter table public.achievements       enable row level security;
alter table public.activity_events    enable row level security;
alter table public.sessions           enable row level security;
alter table public.consents           enable row level security;
alter table public.audit_log          enable row level security;
alter table public.instructor_invites enable row level security;
alter table public.app_config         enable row level security;
alter table public.role_permissions   enable row level security;

-- ---- profiles --------------------------------------------------------
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (
    id = auth.uid()
    or public.is_admin()
    or (public.is_instructor() and public.instructor_has_student(id))
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Column-level privileges: authenticated users may edit ONLY safe columns.
-- role / onboarding_complete / email are changed only server-side.
revoke insert, update, delete on public.profiles from authenticated, anon;
grant update (full_name, age, mobile_e164, college_id, onboarding_step,
              onboarding_draft, guardian_consent, last_active_at)
  on public.profiles to authenticated;
grant select on public.profiles to authenticated;

-- ---- Taxonomy (read: all authenticated; write: admin only) -----------
do $$
declare t text;
begin
  foreach t in array array['colleges','fields','subjects','college_fields']
  loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select using (auth.uid() is not null)', t);
    execute format('drop policy if exists %1$s_admin on public.%1$s', t);
    execute format('create policy %1$s_admin on public.%1$s for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---- Student selections (own rows) ----------------------------------
do $$
declare t text;
begin
  foreach t in array array['student_fields','student_subjects']
  loop
    execute format('drop policy if exists %1$s_own on public.%1$s', t);
    execute format('create policy %1$s_own on public.%1$s for select using (student_id = auth.uid() or public.is_admin())', t);
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format('create policy %1$s_write on public.%1$s for insert with check (student_id = auth.uid())', t);
    execute format('drop policy if exists %1$s_del on public.%1$s', t);
    execute format('create policy %1$s_del on public.%1$s for delete using (student_id = auth.uid())', t);
  end loop;
end $$;

-- ---- Content ---------------------------------------------------------
drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
  for select using (
    public.is_admin()
    or (public.is_instructor() and instructor_id = auth.uid())
    or (deleted_at is null and status = 'published' and visibility <> 'private')
  );

drop policy if exists courses_insert on public.courses;
create policy courses_insert on public.courses
  for insert with check (public.is_admin() or (public.is_instructor() and instructor_id = auth.uid()));

drop policy if exists courses_update on public.courses;
create policy courses_update on public.courses
  for update using (public.is_admin() or instructor_id = auth.uid())
  with check (public.is_admin() or instructor_id = auth.uid());

drop policy if exists courses_delete on public.courses;
create policy courses_delete on public.courses
  for delete using (public.is_admin() or instructor_id = auth.uid());

-- lessons / questions / exams inherit the parent course's ownership.
do $$
declare t text;
begin
  foreach t in array array['lessons','questions','exams']
  loop
    execute format('drop policy if exists %1$s_select on public.%1$s', t);
    execute format($f$create policy %1$s_select on public.%1$s for select using (
      public.is_admin()
      or (course_id is not null and public.owns_course(course_id))
      or (course_id is not null and exists (
            select 1 from public.courses c
            where c.id = course_id and c.deleted_at is null and c.status = 'published' and c.visibility <> 'private'))
    )$f$, t);

    execute format('drop policy if exists %1$s_insert on public.%1$s', t);
    execute format($f$create policy %1$s_insert on public.%1$s for insert with check (
      public.is_admin() or (course_id is not null and public.owns_course(course_id))
    )$f$, t);

    execute format('drop policy if exists %1$s_modify on public.%1$s', t);
    execute format($f$create policy %1$s_modify on public.%1$s for update using (
      public.is_admin() or (course_id is not null and public.owns_course(course_id))
    ) with check (
      public.is_admin() or (course_id is not null and public.owns_course(course_id))
    )$f$, t);

    execute format('drop policy if exists %1$s_delete on public.%1$s', t);
    execute format($f$create policy %1$s_delete on public.%1$s for delete using (
      public.is_admin() or (course_id is not null and public.owns_course(course_id))
    )$f$, t);
  end loop;
end $$;

-- ---- enrollments -----------------------------------------------------
drop policy if exists enroll_select on public.enrollments;
create policy enroll_select on public.enrollments
  for select using (
    student_id = auth.uid() or public.is_admin() or public.owns_course(course_id)
  );
drop policy if exists enroll_insert on public.enrollments;
create policy enroll_insert on public.enrollments
  for insert with check (student_id = auth.uid());
drop policy if exists enroll_delete on public.enrollments;
create policy enroll_delete on public.enrollments
  for delete using (student_id = auth.uid() or public.is_admin());

-- ---- progress --------------------------------------------------------
drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (
    student_id = auth.uid() or public.is_admin() or public.owns_course(course_id)
  );
drop policy if exists progress_write on public.progress;
create policy progress_write on public.progress
  for all using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());

-- ---- quiz_attempts ---------------------------------------------------
drop policy if exists attempts_select on public.quiz_attempts;
create policy attempts_select on public.quiz_attempts
  for select using (
    student_id = auth.uid() or public.is_admin() or public.owns_course(course_id)
  );
drop policy if exists attempts_write on public.quiz_attempts;
create policy attempts_write on public.quiz_attempts
  for all using (student_id = auth.uid() or public.is_admin())
  with check (student_id = auth.uid() or public.is_admin());

-- ---- achievements ----------------------------------------------------
drop policy if exists achievements_select on public.achievements;
create policy achievements_select on public.achievements
  for select using (student_id = auth.uid() or public.is_admin());
drop policy if exists achievements_insert on public.achievements;
create policy achievements_insert on public.achievements
  for insert with check (student_id = auth.uid() or public.is_admin());

-- ---- activity_events (append-only) ----------------------------------
drop policy if exists events_select on public.activity_events;
create policy events_select on public.activity_events
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or (public.is_instructor() and user_id is not null and public.instructor_has_student(user_id))
  );

-- INSERT only, own rows. No UPDATE/DELETE policy => append-only.
drop policy if exists events_insert on public.activity_events;
create policy events_insert on public.activity_events
  for insert with check (user_id = auth.uid());

revoke update, delete on public.activity_events from authenticated, anon;

-- ---- sessions --------------------------------------------------------
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- consents --------------------------------------------------------
drop policy if exists consents_select on public.consents;
create policy consents_select on public.consents
  for select using (student_id = auth.uid() or public.is_admin());
drop policy if exists consents_insert on public.consents;
create policy consents_insert on public.consents
  for insert with check (student_id = auth.uid());
revoke update, delete on public.consents from authenticated, anon;

-- ---- audit_log (admin read only; written by triggers / Edge fns) ------
drop policy if exists audit_select on public.audit_log;
create policy audit_select on public.audit_log
  for select using (public.is_admin());
revoke insert, update, delete on public.audit_log from authenticated, anon;

-- ---- instructor_invites (admin only; Edge fns use service role) ------
drop policy if exists invites_admin on public.instructor_invites;
create policy invites_admin on public.instructor_invites
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- app_config ------------------------------------------------------
drop policy if exists app_config_read on public.app_config;
create policy app_config_read on public.app_config
  for select using (auth.uid() is not null);
drop policy if exists app_config_admin on public.app_config;
create policy app_config_admin on public.app_config
  for all using (public.is_admin()) with check (public.is_admin());

-- ---- role_permissions ------------------------------------------------
drop policy if exists role_perms_read on public.role_permissions;
create policy role_perms_read on public.role_permissions
  for select using (auth.uid() is not null);
drop policy if exists role_perms_admin on public.role_permissions;
create policy role_perms_admin on public.role_permissions
  for all using (public.is_admin()) with check (public.is_admin());
