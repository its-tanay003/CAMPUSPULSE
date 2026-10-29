-- Security Negative-Test Suite for CampusPulse RLS & Authorization
-- File: supabase/tests/rls_negative_tests.sql
-- Run in Supabase SQL Editor or automated CI pgTAP suite to verify 5 negative test cases.

begin;

-- Create Mock Identities in auth.users
insert into auth.users (id, email)
values 
  ('11111111-1111-1111-1111-111111111111', 'student.alice@campus.edu'),
  ('22222222-2222-2222-2222-222222222222', 'student.bob@campus.edu'),
  ('33333333-3333-3333-3333-333333333333', 'organizer.gdsc@campus.edu'),
  ('44444444-4444-4444-4444-444444444444', 'organizer.acm@campus.edu'),
  ('55555555-5555-5555-5555-555555555555', 'admin.officer@campus.edu')
on conflict (id) do nothing;

-- Populate Profiles with specific initial roles
insert into public.profiles (id, email, full_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'student.alice@campus.edu', 'Alice Student', 'student'),
  ('22222222-2222-2222-2222-222222222222', 'student.bob@campus.edu', 'Bob Student', 'student'),
  ('33333333-3333-3333-3333-333333333333', 'organizer.gdsc@campus.edu', 'GDSC Lead', 'organizer'),
  ('44444444-4444-4444-4444-444444444444', 'organizer.acm@campus.edu', 'ACM Lead', 'organizer'),
  ('55555555-5555-5555-5555-555555555555', 'admin.officer@campus.edu', 'Admin Officer', 'admin')
on conflict (id) do update set role = excluded.role;

-- Bind Membership (GDSC Lead is member of org-google-dev only; ACM Lead is member of org-acm only)
insert into public.organization_members (organization_id, user_id, role)
values
  ('org-google-dev', '33333333-3333-3333-3333-333333333333', 'lead'),
  ('org-acm', '44444444-4444-4444-4444-444444444444', 'lead')
on conflict do nothing;

-- ============================================================================
-- TEST 1: Student cannot read another student's saved events
-- ============================================================================
-- Seed saved event for Bob
insert into public.saved_events (user_id, event_id)
values ('22222222-2222-2222-2222-222222222222', 'evt-ai-agentic-2026')
on conflict do nothing;

-- Execute as Alice:
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

do $$
declare
  cnt integer;
begin
  select count(*) into cnt from public.saved_events where user_id = '22222222-2222-2222-2222-222222222222';
  if cnt > 0 then
    raise exception 'FAIL: Alice was able to read Bob''s private saved events!';
  else
    raise notice 'PASS: Test 1 - Alice cannot read Bob''s saved events (returned 0 rows).';
  end if;
end $$;

-- ============================================================================
-- TEST 2: Organizer cannot modify another organization's event
-- ============================================================================
-- Execute as GDSC Lead (attempting to update an ACM event)
set local "request.jwt.claim.sub" = '33333333-3333-3333-3333-333333333333';

do $$
begin
  update public.events
  set title = 'Unauthorized Title Change by GDSC'
  where organization_id = 'org-acm';

  -- In PostgreSQL RLS, updating 0 rows without privilege does not throw by default,
  -- but verify the row was not changed:
  if exists (select 1 from public.events where organization_id = 'org-acm' and title = 'Unauthorized Title Change by GDSC') then
    raise exception 'FAIL: GDSC Lead was able to modify ACM''s event!';
  else
    raise notice 'PASS: Test 2 - Organizer cannot modify another organization''s event.';
  end if;
end $$;

-- ============================================================================
-- TEST 3: Student cannot approve an event
-- ============================================================================
-- Execute as Student Alice attempting to insert into approvals table
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

do $$
begin
  insert into public.approvals (event_id, reviewer_id, decision, reason)
  values ('evt-hack-clash-seeded', '11111111-1111-1111-1111-111111111111', 'approved', 'Student self-approval');

  raise exception 'FAIL: Student was able to insert into approvals table!';
exception when insufficient_privilege or check_violation then
  raise notice 'PASS: Test 3 - Student cannot approve an event (RLS denied insert).';
end $$;

-- ============================================================================
-- TEST 4: User cannot assign themselves an administrator role
-- ============================================================================
-- Execute as Student Alice attempting to escalate role to 'admin'
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

do $$
begin
  update public.profiles
  set role = 'admin'
  where id = '11111111-1111-1111-1111-111111111111';

  -- Check if role was escalated
  if exists (select 1 from public.profiles where id = '11111111-1111-1111-1111-111111111111' and role = 'admin') then
    raise exception 'FAIL: Privilege escalation succeeded! Alice changed role to admin.';
  else
    raise notice 'PASS: Test 4 - Student cannot escalate role to admin (RLS with-check blocked update).';
  end if;
end $$;

-- ============================================================================
-- TEST 5: Unauthenticated visitor cannot read private drafts
-- ============================================================================
-- Execute as anonymous / public visitor (no jwt claim)
set local role anon;
reset "request.jwt.claim.sub";

do $$
declare
  draft_count integer;
begin
  select count(*) into draft_count from public.events where status = 'draft';
  if draft_count > 0 then
    raise exception 'FAIL: Public visitor was able to read draft events!';
  else
    raise notice 'PASS: Test 5 - Unauthenticated visitor cannot view private drafts (returned 0 rows).';
  end if;
end $$;

rollback;

