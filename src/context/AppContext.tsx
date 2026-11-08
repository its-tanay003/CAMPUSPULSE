import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserProfile, 
  CampusEvent, 
  Organization, 
  OrganizationMember,
  Venue, 
  SavedEvent, 
  Registration, 
  ApprovalAction,
  UserRole,
  EventStatus,
  CampusNotification,
  EventAnnouncement,
  EventFeedback
} from '../types';
import { 
  DEMO_PROFILES, 
  DEMO_EVENTS, 
  DEMO_ORGANIZATIONS, 
  DEMO_VENUES, 
  INITIAL_SAVED_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_APPROVALS,
  INITIAL_ORGANIZATION_MEMBERS
} from '../lib/demoData';
import { isValidStatusTransition } from '../lib/lifecycleManager';
import { detectEventConflicts } from '../lib/clashDetector';

export const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-student-1',
    title: 'HackCampus 2026 Registration Open',
    message: 'Official team check-in and problem statement release at Shanti Devi Hall.',
    type: 'event_reminder',
    link: '/events/evt-101',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'usr-student-1',
    title: 'Zero-Clash Clearance Granted',
    message: 'Your saved workshop on Web3 Development has been verified and confirmed.',
    type: 'approval',
    link: '/events/evt-102',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'usr-student-1',
    title: 'Venue Advisory Notice',
    message: 'Robotics Bootcamp moved from Baldev Raj Mittal Unipolis to Room 34-201.',
    type: 'announcement',
    link: '/events/evt-103',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  switchRole: (role: UserRole) => void;
  
  events: CampusEvent[];
  organizations: Organization[];
  venues: Venue[];
  organizationMembers: OrganizationMember[];
  savedEvents: SavedEvent[];
  registrations: Registration[];
  approvals: ApprovalAction[];
  notifications: CampusNotification[];
  feedbacks: EventFeedback[];

  // Student Actions
  toggleSaveEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  registerForEvent: (eventId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  isEventRegistered: (eventId: string) => boolean;
  updateUserInterests: (interests: string[]) => void;
  toggleFollowOrganization: (orgId: string) => void;
  isOrganizationFollowed: (orgId: string) => boolean;
  markNotificationAsRead: (notifId: string) => void;
  markAllNotificationsAsRead: () => void;
  submitEventFeedback: (eventId: string, rating: number, feedbackText: string) => Promise<{ success: boolean }>;

  // Organizer Actions
  createOrUpdateEvent: (eventData: Partial<CampusEvent>) => Promise<{ success: boolean; event?: CampusEvent; error?: string }>;
  cancelEvent: (eventId: string) => void;
  getUserOrganizations: (userId?: string) => Organization[];
  canManageEvent: (event: CampusEvent, userId?: string) => boolean;
  addEventAnnouncement: (eventId: string, title: string, message: string, type: 'update' | 'venue_change' | 'timing_change' | 'important') => Promise<{ success: boolean }>;

  // Admin Actions
  reviewEventApproval: (eventId: string, decision: 'approved' | 'changes_requested' | 'rejected', reason: string) => void;
  updateVenue: (venueData: Partial<Venue> & { id: string }) => { success: boolean; error?: string };
  verifyOrganization: (orgId: string, verify: boolean, notes?: string) => { success: boolean; error?: string };

  // Global State
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('cp_user');
    return cached ? JSON.parse(cached) : DEMO_PROFILES[0];
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    const cached = localStorage.getItem('cp_events');
    const raw = cached ? JSON.parse(cached) : DEMO_EVENTS;
    return raw.map((e: CampusEvent) => ({
      ...e,
      organization: DEMO_ORGANIZATIONS.find(o => o.id === e.organization_id),
      venue: DEMO_VENUES.find(v => v.id === e.venue_id)
    }));
  });

  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const cached = localStorage.getItem('cp_organizations');
    return cached ? JSON.parse(cached) : DEMO_ORGANIZATIONS;
  });

  const [venues, setVenues] = useState<Venue[]>(() => {
    const cached = localStorage.getItem('cp_venues');
    return cached ? JSON.parse(cached) : DEMO_VENUES;
  });

  const [organizationMembers] = useState<OrganizationMember[]>(() => {
    const cached = localStorage.getItem('cp_org_members');
    return cached ? JSON.parse(cached) : INITIAL_ORGANIZATION_MEMBERS;
  });

  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>(() => {
    const cached = localStorage.getItem('cp_saved');
    return cached ? JSON.parse(cached) : INITIAL_SAVED_EVENTS;
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const cached = localStorage.getItem('cp_registrations');
    return cached ? JSON.parse(cached) : INITIAL_REGISTRATIONS;
  });

  const [approvals, setApprovals] = useState<ApprovalAction[]>(() => {
    const cached = localStorage.getItem('cp_approvals');
    return cached ? JSON.parse(cached) : INITIAL_APPROVALS;
  });

  const [notifications, setNotifications] = useState<CampusNotification[]>(() => {
    const cached = localStorage.getItem('cp_notifications');
    return cached ? JSON.parse(cached) : INITIAL_NOTIFICATIONS;
  });

  const [feedbacks, setFeedbacks] = useState<EventFeedback[]>(() => {
    const cached = localStorage.getItem('cp_feedbacks');
    return cached ? JSON.parse(cached) : [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem('cp_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('cp_saved', JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    localStorage.setItem('cp_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('cp_approvals', JSON.stringify(approvals));
  }, [approvals]);

  useEffect(() => {
    localStorage.setItem('cp_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('cp_organizations', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('cp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cp_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cp_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cp_user');
    }
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const match = DEMO_PROFILES.find(p => p.role === role);
    if (match) {
      setCurrentUser(match);
    }
  };

  const toggleSaveEvent = (eventId: string) => {
    if (!currentUser) return;
    setSavedEvents(prev => {
      const exists = prev.some(s => s.user_id === currentUser.id && s.event_id === eventId);
      if (exists) {
        return prev.filter(s => !(s.user_id === currentUser.id && s.event_id === eventId));
      } else {
        return [
          ...prev,
          {
            id: `saved-${Date.now()}`,
            user_id: currentUser.id,
            event_id: eventId,
            created_at: new Date().toISOString()
          }
        ];
      }
    });
  };

  const isEventSaved = (eventId: string): boolean => {
    if (!currentUser) return false;
    return savedEvents.some(s => s.user_id === currentUser.id && s.event_id === eventId);
  };

  const registerForEvent = async (eventId: string, notes?: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Authentication required to register for campus activities.' };
    }

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }

    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline).getTime();
      if (Date.now() > deadline) {
        return { success: false, message: 'Registration has closed for this event.' };
      }
    }

    const alreadyRegistered = registrations.some(r => r.user_id === currentUser.id && r.event_id === eventId);
    if (alreadyRegistered) {
      return { success: false, message: 'You already hold a confirmed admission pass for this event.' };
    }

    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      user_id: currentUser.id,
      event_id: eventId,
      status: 'confirmed',
      source: 'platform',
      notes,
      created_at: new Date().toISOString()
    };

    setRegistrations(prev => [...prev, newReg]);

    // Create a confirmation notification
    const newNotif: CampusNotification = {
      id: `notif-${Date.now()}`,
      user_id: currentUser.id,
      title: `Pass Confirmed: ${event.title}`,
      message: `Your campus event admission pass has been registered. Venue: ${event.venue?.name || 'On Campus'}.`,
      type: 'event_reminder',
      link: `/events/${event.id}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true, message: 'Registration confirmed. Admission pass issued.' };
  };

  const isEventRegistered = (eventId: string): boolean => {
    if (!currentUser) return false;
    return registrations.some(r => r.user_id === currentUser.id && r.event_id === eventId && r.status === 'confirmed');
  };

  const updateUserInterests = (interests: string[]) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? { ...prev, interests } : null);
  };

  const toggleFollowOrganization = (orgId: string) => {
    if (!currentUser) return;
    const currentFollows = currentUser.followed_org_ids || [];
    const isFollowing = currentFollows.includes(orgId);
    const updated = isFollowing
      ? currentFollows.filter(id => id !== orgId)
      : [...currentFollows, orgId];
    
    setCurrentUser(prev => prev ? { ...prev, followed_org_ids: updated } : null);
  };

  const isOrganizationFollowed = (orgId: string): boolean => {
    if (!currentUser) return false;
    return (currentUser.followed_org_ids || []).includes(orgId);
  };

  const markNotificationAsRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, is_read: true } : n));
  };

  const submitEventFeedback = async (eventId: string, rating: number, feedbackText: string): Promise<{ success: boolean }> => {
    if (!currentUser) return { success: false };
    const newFb: EventFeedback = {
      id: `fb-${Date.now()}`,
      event_id: eventId,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      rating,
      feedback_text: feedbackText,
      created_at: new Date().toISOString()
    };
    setFeedbacks(prev => [newFb, ...prev]);
    return { success: true };
  };

  const addEventAnnouncement = async (
    eventId: string, 
    title: string, 
    message: string, 
    type: 'update' | 'venue_change' | 'timing_change' | 'important'
  ): Promise<{ success: boolean }> => {
    const announcement: EventAnnouncement = {
      id: `ann-${Date.now()}`,
      event_id: eventId,
      title,
      message,
      type,
      created_at: new Date().toISOString(),
      created_by: currentUser?.full_name
    };

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          announcements: [announcement, ...(e.announcements || [])]
        };
      }
      return e;
    }));

    // Broadcast notification to all attendees
    const attendees = registrations.filter(r => r.event_id === eventId).map(r => r.user_id);
    const newNotifs: CampusNotification[] = attendees.map(uid => ({
      id: `notif-ann-${Date.now()}-${uid}`,
      user_id: uid,
      title: `Event Update: ${title}`,
      message,
      type: 'announcement',
      link: `/events/${eventId}`,
      is_read: false,
      created_at: new Date().toISOString()
    }));

    if (newNotifs.length > 0) {
      setNotifications(prev => [...newNotifs, ...prev]);
    }

    return { success: true };
  };

  const getUserOrganizations = (userId?: string): Organization[] => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return [];
    if (currentUser?.role === 'admin') {
      return organizations;
    }
    const myMemberships = organizationMembers.filter(m => m.user_id === targetUserId);
    const myOrgIds = myMemberships.map(m => m.organization_id);
    return organizations.filter(o => myOrgIds.includes(o.id));
  };

  const canManageEvent = (event: CampusEvent, userId?: string): boolean => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return false;
    if (currentUser?.role === 'admin') return true;
    const isMember = organizationMembers.some(
      m => m.user_id === targetUserId && m.organization_id === event.organization_id
    );
    const isCreator = event.created_by === targetUserId;
    return isMember || isCreator;
  };

  const createOrUpdateEvent = async (eventData: Partial<CampusEvent>): Promise<{ success: boolean; event?: CampusEvent; error?: string }> => {
    if (!currentUser || (currentUser.role !== 'organizer' && currentUser.role !== 'admin')) {
      return { success: false, error: 'Unauthorized: Only registered organizers and administrators may propose events.' };
    }

    if (eventData.status === 'pending_review' && eventData.start_time && eventData.end_time && eventData.venue_id) {
      const conflictCheck = detectEventConflicts(
        {
          id: eventData.id || 'temp-id',
          title: eventData.title || '',
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          venue_id: eventData.venue_id
        },
        events,
        venues
      );

      if (conflictCheck.has_hard_conflict) {
        return {
          success: false,
          error: 'Hard collision detected: The designated campus venue is already reserved by another approved event for this interval.'
        };
      }
    }

    if (eventData.id) {
      const existing = events.find(e => e.id === eventData.id);
      if (!existing) {
        return { success: false, error: 'Target event record does not exist.' };
      }

      if (eventData.status && !isValidStatusTransition(existing.status, eventData.status, currentUser.role)) {
        return { success: false, error: `Illegal lifecycle transition from ${existing.status} to ${eventData.status} for role ${currentUser.role}.` };
      }

      const updated: CampusEvent = {
        ...existing,
        ...eventData,
        organization: organizations.find(o => o.id === (eventData.organization_id || existing.organization_id)) || existing.organization,
        venue: venues.find(v => v.id === (eventData.venue_id || existing.venue_id)) || existing.venue,
        updated_at: new Date().toISOString()
      };

      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      return { success: true, event: updated };
    } else {
      const targetStatus: EventStatus = eventData.status || 'draft';
      if (!isValidStatusTransition('draft', targetStatus, currentUser.role)) {
        return { success: false, error: `Illegal initial submission transition to ${targetStatus} by role ${currentUser.role}.` };
      }

      const newId = `evt-${Date.now()}`;
      const newEvent: CampusEvent = {
        id: newId,
        title: eventData.title || 'Untitled Campus Event',
        description: eventData.description || '',
        category: eventData.category || 'Technology',
        target_audience: eventData.target_audience || 'All University Students',
        tags: eventData.tags || [],
        organization_id: eventData.organization_id || organizations[0].id,
        venue_id: eventData.venue_id || venues[0].id,
        start_time: eventData.start_time || new Date().toISOString(),
        end_time: eventData.end_time || new Date(Date.now() + 7200000).toISOString(),
        timezone: eventData.timezone || 'Asia/Kolkata',
        cost: eventData.cost || 'Free',
        capacity: eventData.capacity,
        registration_method: eventData.registration_method || 'internal',
        registration_url: eventData.registration_url,
        registration_deadline: eventData.registration_deadline,
        cover_image: eventData.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        contact_email: eventData.contact_email || currentUser.email,
        status: targetStatus,
        created_by: currentUser.id,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: organizations.find(o => o.id === eventData.organization_id),
        venue: venues.find(v => v.id === eventData.venue_id),
        agenda: eventData.agenda,
        speakers: eventData.speakers,
        faqs: eventData.faqs,
        rules: eventData.rules,
        competition_details: eventData.competition_details
      };

      setEvents(prev => [newEvent, ...prev]);
      return { success: true, event: newEvent };
    }
  };

  const cancelEvent = (eventId: string) => {
    if (!currentUser) return;
    const target = events.find(e => e.id === eventId);
    if (!target) return;

    if (!canManageEvent(target, currentUser.id)) {
      alert('Unauthorized: You do not hold management clearance for this event.');
      return;
    }

    if (!isValidStatusTransition(target.status, 'cancelled', currentUser.role)) {
      alert(`Illegal transition: cannot cancel event in ${target.status} state.`);
      return;
    }

    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'cancelled', updated_at: new Date().toISOString() } : e));
  };

  const reviewEventApproval = (
    eventId: string, 
    decision: 'approved' | 'changes_requested' | 'rejected', 
    reason: string
  ) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Security violation: Only verified administrators can execute approval transitions.');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    let targetStatus: EventStatus = 'published';
    if (decision === 'approved') targetStatus = 'published';
    if (decision === 'changes_requested') targetStatus = 'changes_requested';
    if (decision === 'rejected') targetStatus = 'rejected';

    if (!isValidStatusTransition(event.status, targetStatus, 'admin')) {
      alert(`Invalid administrative transition from ${event.status} to ${targetStatus}.`);
      return;
    }

    const newApproval: ApprovalAction = {
      id: `appr-${Date.now()}`,
      event_id: eventId,
      reviewer_id: currentUser.id,
      reviewer_name: currentUser.full_name,
      decision,
      reason,
      created_at: new Date().toISOString()
    };

    setApprovals(prev => [newApproval, ...prev]);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: targetStatus, updated_at: new Date().toISOString() } : e));
  };

  const updateVenue = (venueData: Partial<Venue> & { id: string }): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Permission denied: Only administrators can modify venue records.' };
    }

    const existing = venues.find(v => v.id === venueData.id);
    if (!existing) {
      return { success: false, error: 'Venue not found.' };
    }

    const updated: Venue = {
      ...existing,
      ...venueData,
      updated_at: new Date().toISOString()
    };

    setVenues(prev => prev.map(v => v.id === updated.id ? updated : v));
    return { success: true };
  };

  const verifyOrganization = (orgId: string, verify: boolean, notes?: string): { success: boolean; error?: string } => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Permission denied: Only administrators can execute organization verification.' };
    }

    const existing = organizations.find(o => o.id === orgId);
    if (!existing) {
      return { success: false, error: 'Organization not found.' };
    }

    const updated: Organization = {
      ...existing,
      is_verified: verify,
      verified_by: verify ? currentUser.full_name : undefined,
      verified_at: verify ? new Date().toISOString() : undefined,
      verification_notes: notes || (verify ? 'Verified by campus student welfare administration.' : 'Verification revoked or suspended.')
    };

    setOrganizations(prev => prev.map(o => o.id === updated.id ? updated : o));
    return { success: true };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        events,
        organizations,
        venues,
        organizationMembers,
        savedEvents,
        registrations,
        approvals,
        notifications,
        feedbacks,
        toggleSaveEvent,
        isEventSaved,
        registerForEvent,
        isEventRegistered,
        updateUserInterests,
        toggleFollowOrganization,
        isOrganizationFollowed,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitEventFeedback,
        createOrUpdateEvent,
        cancelEvent,
        getUserOrganizations,
        canManageEvent,
        addEventAnnouncement,
        reviewEventApproval,
        updateVenue,
        verifyOrganization,
        isLoading,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
