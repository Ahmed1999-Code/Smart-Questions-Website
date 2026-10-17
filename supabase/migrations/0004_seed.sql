-- =====================================================================
-- EduAI Pro — 0004 seed: app_config + named permission matrix
-- Idempotent. Re-running is safe.
-- =====================================================================

insert into public.app_config (key, value) values
  ('signup', jsonb_build_object(
      'under18_policy', 'require',              -- 'require' | 'allow' | 'block'
      'require_guardian_consent', true,
      'requires_email_verification', true)),
  ('engagement', jsonb_build_object(
      'active_minutes_7d', 30,                  -- >= this => "active" (configurable)
      'inactive_days', 7,                       -- no events for N days => "inactive"
      'device_only', true,
      'store_ip', false)),
  ('email', jsonb_build_object(
      'provider', 'supabase',                   -- swap to 'resend' | 'sendgrid' | 'postmark'
      'from_name', 'EduAI Pro')),
  ('onboarding', jsonb_build_object(
      'steps', 5,
      'welcome_message', 'Let''s begin our journey toward excellence!'))
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.role_permissions (role, permission) values
  -- Admin
  ('admin', 'admin.grant_instructor'),
  ('admin', 'admin.revoke_instructor'),
  ('admin', 'admin.manage_taxonomy'),
  ('admin', 'admin.assign_instructor'),
  ('admin', 'admin.view_all_content'),
  ('admin', 'admin.view_all_activity'),
  ('admin', 'admin.export'),
  ('admin', 'admin.audit'),
  ('admin', 'admin.configure_engagement'),
  ('admin', 'content.create'),
  ('admin', 'content.edit'),
  ('admin', 'content.delete'),
  ('admin', 'content.publish'),
  ('admin', 'quiz.create'),
  ('admin', 'quiz.edit'),
  ('admin', 'quiz.delete'),
  ('admin', 'view_analytics.own'),
  -- Instructor (scoped to own courses only)
  ('instructor', 'content.create'),
  ('instructor', 'content.edit'),
  ('instructor', 'content.delete'),
  ('instructor', 'content.publish'),
  ('instructor', 'quiz.create'),
  ('instructor', 'quiz.edit'),
  ('instructor', 'quiz.delete'),
  ('instructor', 'view_analytics.own'),
  ('instructor', 'view.student_activity.own_courses'),
  ('instructor', 'view.student_progress.own_courses'),
  -- Instructor must NOT have: admin.export, admin.audit, admin.view_all_activity
  ('student', 'view.own_progress'),
  ('student', 'take_quiz'),
  ('student', 'view_analytics.own'),
  ('student', 'follow_course')
on conflict (role, permission) do nothing;
