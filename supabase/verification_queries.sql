-- Verification Scripts for CampusPulse Database Schema
-- Run in Supabase SQL Editor or psql to verify constraints, queries, and security.

-- 1. Verify all 14 core tables exist in public schema
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;

-- Expected 14 tables:
-- approvals, audit_logs, event_categories, event_conflict_reviews, event_reports,
-- event_tags, events, notification_preferences, organization_members,
-- organizations, profiles, registrations, saved_events, venues.

-- 2. Verify Time Overlap Constraint on Events table
-- Inserting an event where start_time >= end_time should FAIL with valid_event_time constraint violation:
do $$
begin
  insert into public.events (
    id, title, description, category, organization_id, venue_id,
    start_time, end_time, registration_method, status
  ) values (
    'test-invalid-time', 'Test Invalid Event', 'Desc', 'Technology',
    'org-test', 'venue-test',
    '2026-11-01 18:00:00+05:30', '2026-11-01 17:00:00+05:30',
    'none', 'draft'
  );
  raise exception 'Constraint check failed: event with start_time >= end_time was allowed!';
exception when check_violation then
  raise notice 'SUCCESS: valid_event_time check constraint correctly rejected invalid interval.';
end $$;

-- 3. Verify Unique Saved Event Constraint
-- A user saving the exact same event twice must trigger a unique violation:
select conname, contype 
from pg_constraint 
where conrelid = 'public.saved_events'::regclass;

-- 4. Verify Authoritative Venue Double-Booking Query (Core Clash Detection Engine)
-- Given a candidate event interval [CandStart, CandEnd] and venue V:
-- Condition: CandStart < B.end_time AND CandEnd > B.start_time
select 
  e.id,
  e.title,
  e.venue_id,
  v.name as venue_name,
  e.start_time,
  e.end_time
from public.events e
join public.venues v on e.venue_id = v.id
where e.venue_id = 'venue-block34-audi'
  and e.status in ('published', 'pending_review')
  and '2026-10-31 15:00:00+05:30'::timestamptz < e.end_time
  and '2026-10-31 18:00:00+05:30'::timestamptz > e.start_time;

-- 5. Verify RLS is enabled on all tables
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
