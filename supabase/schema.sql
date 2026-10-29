-- CampusPulse Schema (PostgreSQL + Supabase RLS)
-- Source: INT335 P17 Website Blueprint (Section 10 & 11)

-- 1. Profiles (Student / Organizer / Admin)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  avatar_url text,
  role text not null check (role in ('student', 'organizer', 'admin')) default 'student',
  campus text not null default 'LPU Main Campus',
  interests text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Organizations (Clubs & Departments)
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
  created_at timestamptz default now()
);

-- 3. Organization Members (organizer role binding)
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('lead', 'coordinator', 'member')),
  created_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- 4. Venues (Campus authoritative locations)
create table if not exists public.venues (
  id text primary key,
  name text not null,
  location text not null,
  building text not null,
  capacity integer,
  authority text not null default 'Campus Estate & Room Allocation Office',
  is_authoritative boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- 5. Events
create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null,
  category text not null check (category in ('Technology', 'Cultural', 'Sports', 'Workshops', 'Research', 'Music', 'Photography', 'Volunteering', 'Academic')),
  target_audience text not null default 'All Students',
  tags text[] default '{}',
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_event_time check (start_time < end_time)
);

-- 6. Saved Events
create table if not exists public.saved_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, event_id)
);

-- 7. Registrations (Internal platform-managed or recorded)
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.events(id) on delete cascade,
  status text not null check (status in ('confirmed', 'waitlisted', 'cancelled', 'attended')) default 'confirmed',
  source text not null default 'platform',
  notes text,
  created_at timestamptz default now(),
  unique (user_id, event_id)
);

-- 8. Approvals & Reviews
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  decision text not null check (decision in ('approved', 'changes_requested', 'rejected')),
  reason text not null,
  created_at timestamptz default now()
);

-- 9. Clash Reviews / Conflict Audits
create table if not exists public.event_conflict_reviews (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  conflicting_event_id text references public.events(id) on delete cascade,
  severity text not null check (severity in ('hard_conflict', 'strong_warning', 'heads_up')),
  rule_triggered text not null,
  rationale text not null,
  resolution text,
  resolved_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 10. Followed Organizations
create table if not exists public.followed_organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id text not null references public.organizations(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, organization_id)
);

-- 11. Notification Preferences
create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_reminders boolean not null default true,
  schedule_conflicts boolean not null default true,
  club_updates boolean not null default true,
  weekly_digest boolean not null default false,
  unique (user_id)
);

-- 12. Feedback
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  event_id text not null references public.events(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comments text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY POLICIES (Supabase PostgreSQL)
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.saved_events enable row level security;
alter table public.registrations enable row level security;
alter table public.approvals enable row level security;
alter table public.event_conflict_reviews enable row level security;
alter table public.followed_organizations enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.feedback enable row level security;

-- Profiles: Anyone authenticated can read profiles; users update only own profile.
create policy "Profiles read policy" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Organizations: Read all; only verified admins manage
create policy "Public read organizations" on public.organizations
  for select using (true);

-- Venues: Public read; admin manage
create policy "Public read venues" on public.venues
  for select using (true);

-- Events:
-- Public can read 'published', 'completed', 'cancelled'
create policy "Public can view published events" on public.events
  for select using (
    status in ('published', 'completed', 'cancelled')
    or (auth.uid() is not null and created_by = auth.uid())
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Organizers can insert own events" on public.events
  for insert with check (
    auth.uid() is not null and (
      exists (
        select 1 from public.organization_members
        where organization_members.user_id = auth.uid()
        and organization_members.organization_id = events.organization_id
      )
      or exists (
        select 1 from public.profiles
        where profiles.id = auth.uid() and profiles.role = 'admin'
      )
    )
  );

create policy "Organizers can update own events" on public.events
  for update using (
    (auth.uid() = created_by and status in ('draft', 'changes_requested'))
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Saved Events: strict student data privacy
create policy "Users can view own saved events" on public.saved_events
  for select using (auth.uid() = user_id);

create policy "Users can insert own saved events" on public.saved_events
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own saved events" on public.saved_events
  for delete using (auth.uid() = user_id);

-- Registrations: private attendee lists
create policy "Users can view own registrations" on public.registrations
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.events
      where events.id = registrations.event_id and events.created_by = auth.uid()
    )
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can register self" on public.registrations
  for insert with check (auth.uid() = user_id);

-- Approvals: Admins create and view approvals; Organizers can view approvals of their events
create policy "Approvals access" on public.approvals
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
    or exists (
      select 1 from public.events
      where events.id = approvals.event_id and events.created_by = auth.uid()
    )
  );

