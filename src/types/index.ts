export type UserRole = 'student' | 'organizer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  campus: string;
  interests: string[];
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'club' | 'department' | 'society' | 'cell';
  description: string;
  logo_url: string;
  banner_url?: string;
  contact_email: string;
  lead_name: string;
  is_verified: boolean;
  member_count?: number;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'lead' | 'coordinator' | 'member';
  created_at?: string;
  organization?: Organization;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  building: string;
  capacity?: number;
  authority: string;
  is_authoritative: boolean;
  is_active: boolean;
}

export type EventCategory = 
  | 'Technology' 
  | 'Cultural' 
  | 'Sports' 
  | 'Workshops' 
  | 'Research' 
  | 'Music' 
  | 'Photography' 
  | 'Volunteering' 
  | 'Academic';

export type EventStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'published' 
  | 'changes_requested' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  target_audience: string;
  tags: string[];
  organization_id: string;
  organization?: Organization;
  venue_id: string;
  venue?: Venue;
  start_time: string; // ISO 8601
  end_time: string;   // ISO 8601
  timezone: string;
  cost: string;
  capacity?: number;
  registration_method: 'internal' | 'external' | 'none';
  registration_url?: string;
  registration_deadline?: string;
  cover_image?: string;
  contact_email?: string;
  status: EventStatus;
  created_by?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface SavedEvent {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  event?: CampusEvent;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled' | 'attended';
  source: 'platform' | 'imported';
  notes?: string;
  created_at: string;
  event?: CampusEvent;
}

export interface ConflictItem {
  severity: 'hard_conflict' | 'strong_warning' | 'heads_up';
  title: string;
  rule_triggered: string;
  rationale: string;
  conflicting_event: CampusEvent;
  venue_name?: string;
  overlapping_interval?: string;
  suggested_action: string;
}

export interface ApprovalAction {
  id: string;
  event_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  decision: 'approved' | 'changes_requested' | 'rejected';
  reason: string;
  created_at: string;
}

