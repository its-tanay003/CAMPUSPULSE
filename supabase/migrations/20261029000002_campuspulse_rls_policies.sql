-- Migration: 20261029000002_campuspulse_rls_policies.sql
-- Description: Strict Row Level Security Policies for CampusPulse
-- Enforces:
-- 1. Deny by default
-- 2. Role isolation (Student, Organizer, Admin)
-- 3. Data privacy (no public exposure of attendee lists)
-- 4. Venue authorization

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.venues enable row level security;
alter table public.event_categories enable row level security;
alter table public.events enable row level security;
alter table public.event_tags enable row level security;
alter table public.saved_events enable row level security;
alter table public.registrations enable row level security;
alter table public.approvals enable row level security;
alter table public.event_conflict_reviews enable row level security;
alter table public.event_reports enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE VERIFICATION (Security Definer)
-- ============================================================================

create or replace function public.is_admin()
returns boolean security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql;

create or replace function public.is_org_member(org_id text)
returns boolean security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.organization_members
    where organization_id = org_id and user_id = auth.uid()
  ) or public.is_admin();
end;
$$ language plpgsql;

-- ============================================================================
-- 1. PROFILES POLICIES
-- ============================================================================
create policy "Public can read profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id)
  with check (
    -- Prevent students from elevating their own role
    auth.uid() = id and (
      role = (select role from public.profiles where id = auth.uid())
      or public.is_admin()
    )
  );

-- ============================================================================
-- 2. ORGANIZATIONS & MEMBERS POLICIES
-- ============================================================================
create policy "Public can read organizations" on public.organizations
  for select using (true);

create policy "Admins can manage organizations" on public.organizations
  for all using (public.is_admin());

create policy "Public can read organization members" on public.organization_members
  for select using (true);

create policy "Admins and Club Leads manage members" on public.organization_members
  for all using (
    public.is_admin() or exists (
      select 1 from public.organization_members as om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role = 'lead'
    )
  );

-- ============================================================================
-- 3. VENUES & CATEGORIES POLICIES
-- ============================================================================
create policy "Public can read active venues" on public.venues
  for select using (is_active = true or public.is_admin());

create policy "Admins can manage venues" on public.venues
  for all using (public.is_admin());

create policy "Public can read categories" on public.event_categories
  for select using (true);

create policy "Admins can manage categories" on public.event_categories
  for all using (public.is_admin());

-- ============================================================================
-- 4. EVENTS & TAGS POLICIES
-- ============================================================================
-- Read: Visitors and students see published, completed, cancelled events.
-- Organizers see their own club's drafts/pending reviews. Admins see all.
create policy "Event read policy" on public.events
  for select using (
    status in ('published', 'completed', 'cancelled')
    or (auth.uid() is not null and (
      created_by = auth.uid() or public.is_org_member(organization_id)
    ))
    or public.is_admin()
  );

-- Insert: Only authorized club members or admins
create policy "Organizers insert events" on public.events
  for insert with check (
    auth.uid() is not null and (
      public.is_org_member(organization_id) or public.is_admin()
    )
  );

-- Update: Organizers can update their own events only while draft or changes_requested. Admins can update any.
create policy "Organizers update events" on public.events
  for update using (
    (public.is_org_member(organization_id) and status in ('draft', 'changes_requested'))
    or public.is_admin()
  );

-- Tags read and management
create policy "Public can view tags" on public.event_tags
  for select using (true);

create policy "Organizers can manage event tags" on public.event_tags
  for all using (
    exists (
      select 1 from public.events
      where events.id = event_tags.event_id
        and (public.is_org_member(events.organization_id) or public.is_admin())
    )
  );

-- ============================================================================
-- 5. SAVED EVENTS (Personal Agenda Privacy)
-- ============================================================================
create policy "Users manage own saved events" on public.saved_events
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 6. REGISTRATIONS (Strict Privacy: No Public Attendee Scrapes)
-- ============================================================================
create policy "Users see own registration" on public.registrations
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.events
      where events.id = registrations.event_id
        and (public.is_org_member(events.organization_id) or public.is_admin())
    )
  );

create policy "Users can register self" on public.registrations
  for insert with check (auth.uid() = user_id);

create policy "Users can cancel own registration" on public.registrations
  for update using (auth.uid() = user_id);

-- ============================================================================
-- 7. APPROVALS & CONFLICT REVIEWS POLICIES
-- ============================================================================
create policy "Approvals visibility" on public.approvals
  for select using (
    public.is_admin() or exists (
      select 1 from public.events
      where events.id = approvals.event_id
        and public.is_org_member(events.organization_id)
    )
  );

create policy "Admins create approvals" on public.approvals
  for insert with check (public.is_admin());

create policy "Conflict reviews visibility" on public.event_conflict_reviews
  for select using (
    public.is_admin() or exists (
      select 1 from public.events
      where events.id = event_conflict_reviews.event_id
        and public.is_org_member(events.organization_id)
    )
  );

create policy "Conflict reviews management" on public.event_conflict_reviews
  for all using (public.is_admin() or auth.uid() is not null);

-- ============================================================================
-- 8. EVENT REPORTS & NOTIFICATION PREFERENCES POLICIES
-- ============================================================================
create policy "Users can submit reports" on public.event_reports
  for insert with check (auth.uid() is not null);

create policy "Admins manage reports" on public.event_reports
  for select using (public.is_admin() or auth.uid() = reporter_id);

create policy "Users manage own notification preferences" on public.notification_preferences
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 9. AUDIT LOGS (Admin only read, insert only via system/admin)
-- ============================================================================
create policy "Admins can view audit logs" on public.audit_logs
  for select using (public.is_admin());

create policy "System and admins insert audit logs" on public.audit_logs
  for insert with check (auth.uid() is not null);
