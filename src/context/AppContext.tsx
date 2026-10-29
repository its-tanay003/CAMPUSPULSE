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
  UserRole 
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

  // Student Actions
  toggleSaveEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  registerForEvent: (eventId: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  isEventRegistered: (eventId: string) => boolean;
  updateUserInterests: (interests: string[]) => void;

  // Organizer Actions
  createOrUpdateEvent: (eventData: Partial<CampusEvent>) => Promise<{ success: boolean; event?: CampusEvent; error?: string }>;
  cancelEvent: (eventId: string) => void;
  getUserOrganizations: (userId?: string) => Organization[];
  canManageEvent: (event: CampusEvent, userId?: string) => boolean;

  // Admin Actions
  reviewEventApproval: (eventId: string, decision: 'approved' | 'changes_requested' | 'rejected', reason: string) => void;

  // Global State
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage cache or demo defaults
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('cp_user');
    return cached ? JSON.parse(cached) : DEMO_PROFILES[0]; // defaults to student
  });

  const [events, setEvents] = useState<CampusEvent[]>(() => {
    const cached = localStorage.getItem('cp_events');
    const raw = cached ? JSON.parse(cached) : DEMO_EVENTS;
    // hydrate venue and org references
    return raw.map((e: CampusEvent) => ({
      ...e,
      organization: DEMO_ORGANIZATIONS.find(o => o.id === e.organization_id),
      venue: DEMO_VENUES.find(v => v.id === e.venue_id)
    }));
  });

  const [organizations] = useState<Organization[]>(DEMO_ORGANIZATIONS);
  const [venues] = useState<Venue[]>(DEMO_VENUES);
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

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state to local storage for realistic persistence
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
            id: `save-${Date.now()}`,
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
      return { success: false, message: 'You must be signed in to register for campus events.' };
    }
    const ev = events.find(e => e.id === eventId);
    if (!ev) return { success: false, message: 'Event not found.' };

    if (ev.status === 'cancelled') {
      return { success: false, message: 'Cannot register for a cancelled event.' };
    }

    if (ev.registration_method === 'external') {
      return { success: false, message: 'Registration for this event is handled on an external portal.' };
    }

    const alreadyRegistered = registrations.some(r => r.user_id === currentUser.id && r.event_id === eventId);
    if (alreadyRegistered) {
      return { success: false, message: 'You are already registered for this event.' };
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
    return { success: true, message: 'Registration confirmed! Check your My Events agenda.' };
  };

  const isEventRegistered = (eventId: string): boolean => {
    if (!currentUser) return false;
    return registrations.some(r => r.user_id === currentUser.id && r.event_id === eventId);
  };

  const updateUserInterests = (interests: string[]) => {
    if (!currentUser) return;
    const updated = { ...currentUser, interests };
    setCurrentUser(updated);
  };

  const getUserOrganizations = (userId?: string): Organization[] => {
    const targetUserId = userId || currentUser?.id;
    if (!targetUserId) return [];
    if (currentUser?.role === 'admin') return organizations;
    const memberOrgIds = organizationMembers
      .filter(m => m.user_id === targetUserId)
      .map(m => m.organization_id);
    return organizations.filter(o => memberOrgIds.includes(o.id));
  };

  const canManageEvent = (event: CampusEvent, userId?: string): boolean => {
    const targetUser = currentUser;
    if (!targetUser) return false;
    if (targetUser.role === 'admin') return true;
    if (targetUser.role !== 'organizer') return false;

    // Check organization membership
    const hasOrgMembership = organizationMembers.some(
      m => m.user_id === targetUser.id && m.organization_id === event.organization_id
    );

    return hasOrgMembership || event.created_by === targetUser.id;
  };

  const createOrUpdateEvent = async (eventData: Partial<CampusEvent>): Promise<{ success: boolean; event?: CampusEvent; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400)); // simulation

    // Authorization Guard
    if (!currentUser) {
      setIsLoading(false);
      return { success: false, error: 'Authentication required.' };
    }

    if (currentUser.role !== 'organizer' && currentUser.role !== 'admin') {
      setIsLoading(false);
      return { success: false, error: 'Permission denied: Only active organizers or administrators can manage events.' };
    }

    const targetOrgId = eventData.organization_id || DEMO_ORGANIZATIONS[0].id;
    const userOrgs = getUserOrganizations(currentUser.id);
    const isMemberOfOrg = userOrgs.some(o => o.id === targetOrgId);

    if (currentUser.role !== 'admin' && !isMemberOfOrg) {
      setIsLoading(false);
      return { 
        success: false, 
        error: `Permission denied: You do not possess active organizer membership in organization ID: ${targetOrgId}.` 
      };
    }

    let targetEvent: CampusEvent;
    if (eventData.id) {
      // update
      const existing = events.find(e => e.id === eventData.id);
      if (!existing) {
        setIsLoading(false);
        return { success: false, error: 'Event not found.' };
      }

      if (!canManageEvent(existing, currentUser.id)) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Permission denied: You cannot edit events belonging to another organization.' 
        };
      }

      // Check lifecycle rules: Organizers can update draft, changes_requested, or pending_review
      if (currentUser.role !== 'admin' && !['draft', 'changes_requested', 'pending_review'].includes(existing.status)) {
        setIsLoading(false);
        return {
          success: false,
          error: `Permission denied: Live or closed event in '${existing.status}' state cannot be directly edited without administrative recall.`
        };
      }

      targetEvent = {
        ...existing,
        ...eventData,
        updated_at: new Date().toISOString()
      };
      setEvents(prev => prev.map(e => e.id === targetEvent.id ? targetEvent : e));
    } else {
      // create new draft or pending
      const id = `evt-${Date.now().toString(36)}`;
      targetEvent = {
        id,
        title: eventData.title || 'Untitled Campus Event',
        description: eventData.description || '',
        category: eventData.category || 'Technology',
        target_audience: eventData.target_audience || 'All Students',
        tags: eventData.tags || [],
        organization_id: targetOrgId,
        venue_id: eventData.venue_id || DEMO_VENUES[0].id,
        start_time: eventData.start_time || new Date().toISOString(),
        end_time: eventData.end_time || new Date(Date.now() + 3600000).toISOString(),
        timezone: 'Asia/Kolkata',
        cost: eventData.cost || 'Free',
        capacity: eventData.capacity,
        registration_method: eventData.registration_method || 'internal',
        registration_url: eventData.registration_url,
        registration_deadline: eventData.registration_deadline,
        cover_image: eventData.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
        contact_email: eventData.contact_email || currentUser.email || 'events@campus.edu',
        status: eventData.status || 'pending_review',
        created_by: currentUser.id,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization: organizations.find(o => o.id === targetOrgId),
        venue: venues.find(v => v.id === (eventData.venue_id || venues[0]?.id))
      };
      setEvents(prev => [targetEvent, ...prev]);
    }

    setIsLoading(false);
    return { success: true, event: targetEvent };
  };

  const cancelEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'cancelled', updated_at: new Date().toISOString() } : e));
  };

  const reviewEventApproval = (
    eventId: string, 
    decision: 'approved' | 'changes_requested' | 'rejected', 
    reason: string
  ) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Security violation: Only administrators can execute approval decisions.');
      return;
    }

    const newApproval: ApprovalAction = {
      id: `app-${Date.now()}`,
      event_id: eventId,
      reviewer_id: currentUser.id,
      reviewer_name: currentUser.full_name,
      decision,
      reason,
      created_at: new Date().toISOString()
    };

    setApprovals(prev => [newApproval, ...prev]);

    const newStatus = decision === 'approved' ? 'published' : decision === 'rejected' ? 'rejected' : 'changes_requested';
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus, updated_at: new Date().toISOString() } : e));
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
        toggleSaveEvent,
        isEventSaved,
        registerForEvent,
        isEventRegistered,
        updateUserInterests,
        createOrUpdateEvent,
        cancelEvent,
        getUserOrganizations,
        canManageEvent,
        reviewEventApproval,
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

