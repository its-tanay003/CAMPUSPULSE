-- Migration: 20261103000004_campuspulse_event_lifecycle_transitions.sql
-- Description: Enforce Event Lifecycle Status Transitions & Submission Audit Integrity
-- Author: Senior Backend Engineer

-- 1. Create a function and trigger to enforce valid state transitions in PostgreSQL
create or replace function public.validate_event_status_transition()
returns trigger security definer set search_path = public as $$
declare
  old_st text;
  new_st text;
begin
  old_st := OLD.status;
  new_st := NEW.status;

  -- Allow if status is unchanged
  if old_st = new_st then
    return NEW;
  end if;

  -- Validation of Allowed State Transitions:
  -- draft -> pending_review, cancelled
  -- pending_review -> published, changes_requested, rejected, cancelled
  -- changes_requested -> pending_review, draft, cancelled
  -- published -> completed, cancelled
  -- rejected -> draft, pending_review
  -- cancelled -> (Terminal, unless admin explicitly restores to draft)
  -- completed -> (Terminal)

  if old_st = 'draft' and new_st not in ('pending_review', 'cancelled') then
    raise exception 'Invalid status transition: draft cannot transition directly to %', new_st;
  end if;

  if old_st = 'pending_review' and new_st not in ('published', 'changes_requested', 'rejected', 'cancelled') then
    raise exception 'Invalid status transition: pending_review cannot transition directly to %', new_st;
  end if;

  if old_st = 'changes_requested' and new_st not in ('pending_review', 'draft', 'cancelled') then
    raise exception 'Invalid status transition: changes_requested cannot transition directly to %', new_st;
  end if;

  if old_st = 'published' and new_st not in ('completed', 'cancelled') then
    raise exception 'Invalid status transition: published cannot transition directly to %', new_st;
  end if;

  if old_st = 'rejected' and new_st not in ('draft', 'pending_review') then
    raise exception 'Invalid status transition: rejected cannot transition directly to %', new_st;
  end if;

  if old_st in ('completed', 'cancelled') and not public.is_admin() then
    raise exception 'Invalid status transition: % is a terminal state that can only be altered by an administrator.', old_st;
  end if;

  -- Non-admins cannot transition to 'published' (Approvals must go through Admin review)
  if new_st = 'published' and not public.is_admin() then
    raise exception 'Permission denied: Only administrators can approve and publish events.';
  end if;

  -- Non-admins cannot transition an event to 'changes_requested' or 'rejected'
  if new_st in ('changes_requested', 'rejected') and not public.is_admin() then
    raise exception 'Permission denied: Only administrators can request changes or reject events.';
  end if;

  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_validate_event_status_transition on public.events;
create trigger trg_validate_event_status_transition
  before update on public.events
  for each row
  execute function public.validate_event_status_transition();

-- 2. Ensure RLS Policy strictly blocks public feed queries for non-published events
-- Even if an attacker directly queries the events table, only 'published', 'completed', or 'cancelled' are visible to public.
-- Drafts, pending_review, changes_requested, and rejected events are hidden from students & visitors.
drop policy if exists "Event read policy" on public.events;

create policy "Event read policy" on public.events
  for select using (
    -- Public visibility rule: Only published, completed, or cancelled events
    status in ('published', 'completed', 'cancelled')
    -- Authorized club member rule: Active organizers can view their own club's drafts/pending/changes_requested
    or (
      auth.uid() is not null and (
        created_by = auth.uid() 
        or public.is_org_member(organization_id)
      )
    )
    -- Administrator rule: Admins can inspect all events in review
    or public.is_admin()
  );

