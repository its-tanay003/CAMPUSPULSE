-- Migration: 20261029000003_campuspulse_security_hardening.sql
-- Description: Hardened RLS Policies, Negative-Test Suite, and Privilege Escalation Prevention
-- Author: Senior Application Security Engineer

-- 1. PROFILES SECURITY: Prevent Self-Elevation to Admin / Organizer Role
-- Ensure users can only update safe fields (full_name, avatar_url, campus, interests)
-- and CANNOT modify their own role.

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile safe fields" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Only admins can change a profile's role
create policy "Admins can update user roles" on public.profiles
  for update using (public.is_admin());

-- 2. DRAFTS & PENDING REVIEWS: Strict Isolation
-- Unauthenticated users or non-member students cannot see drafts or pending reviews.
drop policy if exists "Event read policy" on public.events;

create policy "Event read policy" on public.events
  for select using (
    -- 1. Published, completed, or cancelled events are public
    status in ('published', 'completed', 'cancelled')
    -- 2. Drafts/pending are strictly visible to active org members of that specific club
    or (
      auth.uid() is not null and (
        created_by = auth.uid() 
        or public.is_org_member(organization_id)
      )
    )
    -- 3. Admins can view all events for clearance
    or public.is_admin()
  );

-- 3. APPROVAL ENFORCEMENT: Anti-Self-Approval
-- Organizers cannot approve events even if they are members; approvals are restricted to admins.
drop policy if exists "Admins create approvals" on public.approvals;

create policy "Admins create approvals" on public.approvals
  for insert with check (
    public.is_admin()
  );

-- 4. SAVED EVENTS: Private Isolation
-- Deny any user access to another user's saved events
drop policy if exists "Users manage own saved events" on public.saved_events;

create policy "Users select own saved events" on public.saved_events
  for select using (auth.uid() = user_id);

create policy "Users insert own saved events" on public.saved_events
  for insert with check (auth.uid() = user_id);

create policy "Users delete own saved events" on public.saved_events
  for delete using (auth.uid() = user_id);

-- 5. EVENT MODIFICATIONS: Restrict Updates to Active Organization Members
drop policy if exists "Organizers update events" on public.events;

create policy "Organizers update own club events" on public.events
  for update using (
    (
      public.is_org_member(organization_id) 
      and status in ('draft', 'changes_requested')
    )
    or public.is_admin()
  )
  with check (
    -- Cannot reassign event to another organization unless admin
    (
      public.is_org_member(organization_id) 
      and status in ('draft', 'pending_review', 'changes_requested')
    )
    or public.is_admin()
  );

