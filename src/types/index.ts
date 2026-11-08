export type UserRole = 'student' | 'organizer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  campus: string;
  interests: string[];
  followed_org_ids?: string[];
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
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  member_count?: number;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    website?: string;
    discord?: string;
  };
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
  data_source?: string;
  is_authoritative: boolean;
  is_demo?: boolean;
  is_active: boolean;
  updated_at?: string;
}

export interface VerificationLog {
  id: string;
  organization_id: string;
  organization_name: string;
  reviewer_id: string;
  reviewer_name: string;
  decision: 'verified' | 'unverified';
  notes: string;
  created_at: string;
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

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

export interface SpeakerInfo {
  name: string;
  role: string;
  organization?: string;
  avatar_url?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CompetitionDetails {
  problem_statement?: string;
  eligibility_criteria?: string;
  team_size_min?: number;
  team_size_max?: number;
  evaluation_criteria?: string[];
  rules?: string[];
  prizes?: {
    rank: string;
    reward: string;
  }[];
}

export interface EventAnnouncement {
  id: string;
  event_id: string;
  title: string;
  message: string;
  type: 'update' | 'venue_change' | 'timing_change' | 'important';
  created_at: string;
  created_by?: string;
}

export interface EventFeedback {
  id: string;
  event_id: string;
  user_id: string;
  user_name?: string;
  rating: number; // 1 to 5
  feedback_text: string;
  created_at: string;
}

export interface CampusNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'event_reminder' | 'status_update' | 'announcement' | 'approval';
  link?: string;
  is_read: boolean;
  created_at: string;
}

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

  // Rich detail extensions
  agenda?: AgendaItem[];
  speakers?: SpeakerInfo[];
  faqs?: FAQItem[];
  rules?: string[];
  competition_details?: CompetitionDetails;
  announcements?: EventAnnouncement[];
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

export type ConflictSeverity = 'hard_conflict' | 'advisory_warning' | 'informational_notice';

export interface ConflictItem {
  severity: ConflictSeverity;
  title: string;
  rule_triggered: string;
  rationale: string;
  conflicting_event: CampusEvent;
  venue_name?: string;
  date_string?: string;
  start_time?: string;
  end_time?: string;
  overlapping_interval?: string;
  source_authority: string;
  is_authoritative: boolean;
  suggested_action: string;
  available_resolutions: string[];
}

export interface ConflictCheckResult {
  has_conflicts: boolean;
  has_hard_conflict: boolean;
  can_submit: boolean;
  unverified_venue_warning?: string;
  conflicts: ConflictItem[];
  checked_at: string;
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
