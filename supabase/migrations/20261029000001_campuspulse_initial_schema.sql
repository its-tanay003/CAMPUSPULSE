-- Migration: 20261029000001_campuspulse_initial_schema.sql
-- Description: Core Relational Schema for CampusPulse (INT335 P17 Blueprint)
-- Includes:
-- 1. profiles
-- 2. organizations
-- 3. organization_members
-- 4. venues
-- 5. event_categories
-- 6. events
-- 7. event_tags
-- 8. saved_events
-- 9. registrations
-- 10. approvals
-- 11. event_conflict_reviews
-- 12. event_reports
-- 13. notification_preferences
-- 14. audit_logs

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (Extends Supabase auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  role text not null check (role in ('student', 'organizer', 'admin')) default 'student',
  campus text not null default 'LPU Main Campus',
  interests text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 2. ORGANIZATIONS (Student clubs, societies, and academic departments)
-- ============================================================================
create table if not exists public.organizations (
  id text primary key,
  name text not null,
  slug text unique not null,
  type text not null check (type in ('club', 'department', 'society', 'cell')),
  description text not null,
  logo_url text,
  banner_url text,
  contact_email text not null,
  lead_name text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 3. ORGANIZATION MEMBERS (Role-based access binding users to clubs)
-- ============================================================================
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('lead', 'coordinator', 'member')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ============================================================================
-- 4. VENUES (Authoritative campus rooms and facilities)
-- ============================================================================
create table if not exists public.venues (
  id text primary key,
  name text not null,
  location text not null,
  building text not null,
  capacity integer,
  authority text not null default 'Campus Estate & Room Allocation Office',
  is_authoritative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 5. EVENT CATEGORIES (Controlled taxonomy for reliable filtering)
-- ============================================================================
create table if not exists public.event_categories (
  slug text primary key,
  name text not null,
  description text,
  icon text,
  display_order integer default 0
);

-- Seed standard categories from blueprint
insert into public.event_categories (slug, name, description, icon, display_order)
values
  ('technology', 'Technology', 'AI, software engineering, hackathons and robotics', 'laptop', 1),
  ('workshops', 'Workshops', 'Hands-on practical development and skill sessions', 'wrench', 2),
  ('cultural', 'Cultural', 'Theatre, poetry, fine arts and campus drama', 'masks', 3),
  ('music', 'Music', 'Live acoustic performances, open mics and concerts', 'music', 4),
  ('sports', 'Sports', 'Hostel championships, athletic tournaments and fitness', 'trophy', 5),
  ('research', 'Research', 'Academic paper presentations and technical symposiums', 'microscope', 6),
  ('photography', 'Photography', 'Visual storytelling and media exhibitions', 'camera', 7),
  ('volunteering', 'Volunteering', 'Social outreach and campus community drives', 'heart', 8),
  ('academic', 'Academic', 'Guest lectures, orientation sessions and seminars', 'book', 9)
on conflict (slug) do nothing;

-- ============================================================================
-- 6. EVENTS (Central Event Layer)
-- ============================================================================
create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('Technology', 'Cultural', 'Sports', 'Workshops', 'Research', 'Music', 'Photography', 'Volunteering', 'Academic')),
  target_audience text not null default 'All Students',
  organization_id text not null references public.organizations(id) on delete cascade,
  venue_id text not null references public.venues(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  timezone text not null default 'Asia/Kolkata',
  cost text not null default 'Free',
  capacity integer,
  registration_method text not null check (registration_method in ('internal', 'external', 'none')),
  registration_url text,
  registration_deadline timestamptz,
  cover_image text,
  contact_email text,
  status text not null check (status in ('draft', 'pending_review', 'published', 'changes_requested', 'rejected', 'cancelled', 'completed')) default 'draft',
  created_by uuid references public.profiles(id),
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_event_time check (start_time < end_time)
);

-- ============================================================================
-- 7. EVENT TAGS (Relational event tags for search indexing)
-- ============================================================================
create table if not exists public.event_tags (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (event_id, tag)
);

-- ============================================================================
-- 8. SAVED EVENTS (Student Personal Agenda Bookmarks)
-- ============================================================================
create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ============================================================================
-- 9. REGISTRATIONS (Platform-managed Confirmed Passes)
-- ============================================================================
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  status text not null check (status in ('confirmed', 'waitlisted', 'cancelled', 'attended')) default 'confirmed',
  source text not null default 'platform',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, event_id)
);

-- ============================================================================
-- 10. APPROVALS (Administrative Review Decisions)
-- ============================================================================
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'changes_requested', 'rejected')),
  reason text not null,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 11. EVENT CONFLICT REVIEWS (Clash Detection Engine Audit Records)
-- ============================================================================
create table if not exists public.event_conflict_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  conflicting_event_id text references public.events(id) on delete cascade,
  severity text not null check (severity in ('hard_conflict', 'strong_warning', 'heads_up')),
  rule_triggered text not null,
  rationale text not null,
  resolution text,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 12. EVENT REPORTS (Student Community Integrity Reports)
-- ============================================================================
create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null check (reason in ('incorrect_details', 'venue_changed', 'cancelled_unannounced', 'spam', 'other')),
  details text,
  status text not null check (status in ('pending', 'investigating', 'resolved', 'dismissed')) default 'pending',
  admin_notes text,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 13. NOTIFICATION PREFERENCES (Student User Opt-in Controls)
-- ============================================================================
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_reminders boolean not null default true,
  schedule_conflicts boolean not null default true,
  club_updates boolean not null default true,
  weekly_digest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================================
-- 14. AUDIT LOGS (Immutable Administrative & Security Trace)
-- ============================================================================
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE DISCOVERY & CLASH DETECTION QUERIES
-- ============================================================================

-- Discovery indexes: chronological sort & status filtering
create index if not exists idx_events_status_start_time on public.events(status, start_time);
create index if not exists idx_events_category on public.events(category);
create index if not exists idx_events_organization on public.events(organization_id);

-- Clash detection query index: venue + start/end time intervals
create index if not exists idx_events_venue_schedule on public.events(venue_id, start_time, end_time)
  where status in ('published', 'pending_review');

-- Search index on title and tags
create index if not exists idx_events_title_trgm on public.events using gin (to_tsvector('english', title || ' ' || description));
create index if not exists idx_event_tags_tag on public.event_tags(tag);

-- Personal schedule lookups
create index if not exists idx_saved_events_user on public.saved_events(user_id);
create index if not exists idx_registrations_user on public.registrations(user_id);
create index if not exists idx_registrations_event on public.registrations(event_id);

-- Governance queries
create index if not exists idx_approvals_event on public.approvals(event_id);
create index if not exists idx_event_reports_status on public.event_reports(status);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id, created_at desc);

-- ============================================================================
-- AUTOMATIC UPDATED_AT TRIGGER
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_organizations_updated_at before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger trg_venues_updated_at before update on public.venues
  for each row execute function public.set_updated_at();

create trigger trg_events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

create trigger trg_registrations_updated_at before update on public.registrations
  for each row execute function public.set_updated_at();

create trigger trg_event_reports_updated_at before update on public.event_reports
  for each row execute function public.set_updated_at();

