import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Building2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventCategory } from '../types';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';
import { StatusTimeline } from '../components/StatusTimeline';

const CATEGORIES: EventCategory[] = [
  'Technology',
  'Cultural',
  'Sports',
  'Workshops',
  'Research',
  'Music',
  'Photography',
  'Volunteering',
  'Academic'
];

export const CreateEventPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { venues, events, currentUser, createOrUpdateEvent, getUserOrganizations, canManageEvent, approvals } = useApp();
  const navigate = useNavigate();

  // Filter organizations where the current user has active membership
  const authorizedOrgs = getUserOrganizations(currentUser?.id);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technology');
  const [targetAudience, setTargetAudience] = useState('All Students');
  const [eligibility, setEligibility] = useState('All Registered University Students');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || '');
  const [organizationId, setOrganizationId] = useState(authorizedOrgs[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  const [eventStatus, setEventStatus] = useState<EventCategory | string>('draft');
  const [createdAtDate, setCreatedAtDate] = useState<string>('');
  const [updatedAtDate, setUpdatedAtDate] = useState<string>('');
  
  // Dates & Timing
  const [startDate, setStartDate] = useState('2026-11-05T14:00');
  const [endDate, setEndDate] = useState('2026-11-05T17:30');
  const [regDeadline, setRegDeadline] = useState('2026-11-04T23:59');
  const [timezone] = useState('Asia/Kolkata');
  
  // Cost & Registration
  const [cost, setCost] = useState('Free');
  const [capacity, setCapacity] = useState('150');
  const [regMethod, setRegMethod] = useState<'internal' | 'external' | 'none'>('internal');
  const [regUrl, setRegUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80');

  // Preview Mode Toggle
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Status & Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check unauthorized access
  const isAuthorizedToCreate = currentUser?.role === 'organizer' || currentUser?.role === 'admin';

  // Load existing event data when editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = events.find(e => e.id === id);
      if (existing) {
        // Verify authorization to edit this event
        if (!canManageEvent(existing, currentUser?.id)) {
          setGeneralError('Permission denied: You do not have active organizer membership for the host organization of this event.');
          return;
        }

        setTitle(existing.title);
        setDescription(existing.description);
        setCategory(existing.category);
        setTargetAudience(existing.target_audience);
        setOrganizationId(existing.organization_id);
        setVenueId(existing.venue_id);
        setCost(existing.cost);
        setCapacity(existing.capacity ? String(existing.capacity) : '');
        setRegMethod(existing.registration_method);
        setRegUrl(existing.registration_url || '');
        setContactEmail(existing.contact_email || currentUser?.email || '');
        setEventStatus(existing.status);
        setCreatedAtDate(existing.created_at);
        setUpdatedAtDate(existing.updated_at);
        if (existing.cover_image) setCoverUrl(existing.cover_image);

        // Dates conversion to datetime-local friendly format
        if (existing.start_time) {
          const s = new Date(existing.start_time);
          setStartDate(s.toISOString().slice(0, 16));
        }
        if (existing.end_time) {
          const e = new Date(existing.end_time);
          setEndDate(e.toISOString().slice(0, 16));
        }
        if (existing.registration_deadline) {
          const d = new Date(existing.registration_deadline);
          setRegDeadline(d.toISOString().slice(0, 16));
        }
      } else {
        setGeneralError('Event record not found.');
      }
    }
  }, [isEditing, id, events, currentUser, canManageEvent]);

  // Set default organization if none selected
  useEffect(() => {
    if (!organizationId && authorizedOrgs.length > 0) {
      setOrganizationId(authorizedOrgs[0].id);
    }
  }, [authorizedOrgs, organizationId]);

  // Real-time Clash Detection Engine
  const startIso = startDate ? new Date(startDate).toISOString() : '';
  const endIso = endDate ? new Date(endDate).toISOString() : '';

  const activeConflictResult = detectEventConflicts(
    {
      start_time: startIso,
      end_time: endIso,
      venue_id: venueId,
      category
    },
    events,
    venues,
    id // exclude self when editing
  );

  const hasHardConflict = activeConflictResult.has_hard_conflict;

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setGeneralError(null);
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Event title is required.';
    if (!description.trim()) errors.description = 'Event description is required.';
    if (!venueId) errors.venue = 'Authoritative venue must be selected.';
    if (!organizationId) errors.organization = 'Authorized host club must be selected.';

    if (!startDate) errors.startDate = 'Start date and time are required.';
    if (!endDate) errors.endDate = 'End date and time are required.';

    if (startDate && endDate) {
      const s = new Date(startDate);
      const en = new Date(endDate);
      if (isNaN(s.getTime()) || isNaN(en.getTime())) {
        errors.time = 'Invalid date/time format.';
      } else if (en <= s) {
        errors.time = 'End time must be strictly after start time.';
      }
    }

    if (regDeadline && startDate) {
      const d = new Date(regDeadline);
      const s = new Date(startDate);
      if (d > s) {
        errors.regDeadline = 'Registration deadline cannot be after event start time.';
      }
    }

    if (regMethod === 'external' && !regUrl.trim()) {
      errors.regUrl = 'External registration link is required when external registration is selected.';
    } else if (regMethod === 'external' && !regUrl.startsWith('http://') && !regUrl.startsWith('https://')) {
      errors.regUrl = 'Registration URL must begin with https:// or http://';
    }

    if (contactEmail && !contactEmail.includes('@')) {
      errors.contactEmail = 'A valid contact email address is required.';
    }

    // Preserve valid inputs and display field errors
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Enforce Venue Double-booking Protection for non-drafts
    if (hasHardConflict && !isDraft) {
      setValidationErrors({
        venue: 'Cannot submit for approval with an unresolved hard venue collision. Choose an alternate venue or adjust timing.'
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(id ? { id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      target_audience: targetAudience.trim() || 'All Students',
      organization_id: organizationId,
      venue_id: venueId,
      start_time: startIso,
      end_time: endIso,
      timezone,
      cost: cost.trim() || 'Free',
      capacity: capacity ? Number(capacity) : undefined,
      registration_method: regMethod,
      registration_url: regMethod === 'external' ? regUrl.trim() : undefined,
      registration_deadline: regDeadline ? new Date(regDeadline).toISOString() : undefined,
      cover_image: coverUrl,
      contact_email: contactEmail.trim() || currentUser?.email || 'events@campus.edu',
      status: isDraft ? 'draft' as const : 'pending_review' as const
    };

    const res = await createOrUpdateEvent(payload);

    setIsSubmitting(false);
    if (res.success) {
      navigate('/organizer');
    } else {
      setGeneralError(res.error || 'Failed to save event. Please check inputs.');
    }
  };

  const selectedVenue = venues.find(v => v.id === venueId);
  const selectedOrg = authorizedOrgs.find(o => o.id === organizationId);

  // Unauthorized Guardian
  if (!isAuthorizedToCreate) {
    return (
      <div className="min-h-screen text-slate-100 py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">Organizer Authorization Required</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Only verified club organizers or administrators have permission to access the Event Publishing Studio.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="glass-card hover:border-white/20 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/organizer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Organizer Studio
          </Link>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="text-xs bg-[#050814]/80 hover:bg-[#0b1020] text-cyan-300 border border-white/10 font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>

        {/* Title Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 flex items-center justify-center font-bold">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Authoring Layer</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {isEditing ? 'Edit Authorized Event' : 'Create & Publish Campus Event'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full schema validation, draft privacy, and database-level membership authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Existing Event Lifecycle Timeline Status (If Editing) */}
        {isEditing && id && (
          <div>
            <StatusTimeline
              status={eventStatus as any}
              createdAt={createdAtDate || new Date().toISOString()}
              updatedAt={updatedAtDate || new Date().toISOString()}
              approvalsHistory={approvals.filter(a => a.event_id === id)}
            />
          </div>
        )}

        {/* General Error Banner */}
        {generalError && (
          <div className="glass-card border-rose-500/50 bg-rose-950/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 cols) */}
          <form onSubmit={(e) => handleSubmit(e, false)} className="lg:col-span-8 space-y-6">
            {/* Section 1: Event Information */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">1</span>
                Event Specifications
              </h2>

              <div>
                <label htmlFor="event-title" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                  Event Title *
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (validationErrors.title) {
                      setValidationErrors(prev => ({ ...prev, title: '' }));
                    }
                  }}
                  placeholder="e.g. Annual Autonomous Drone Racing League 2026"
                  className="w-full text-sm p-3.5 bg-[#050814]/80 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                {validationErrors.title && (
                  <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="event-desc" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="event-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (validationErrors.description) {
                      setValidationErrors(prev => ({ ...prev, description: '' }));
                    }
                  }}
                  placeholder="Explain event outcomes, agenda, prerequisites, kit requirements, and who should attend..."
                  className="w-full text-sm p-3.5 bg-[#050814]/80 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition leading-relaxed"
                />
                {validationErrors.description && (
                  <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-cat" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Category *</label>
                  <select
                    id="event-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="event-org" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                    Host Organization (Authorized Memberships) *
                  </label>
                  <select
                    id="event-org"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {authorizedOrgs.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {validationErrors.organization && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.organization}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target-aud" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Target Audience</label>
                  <input
                    id="target-aud"
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. All Students, B.Tech 2nd/3rd Year"
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="eligibility-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Eligibility Criteria</label>
                  <input
                    id="eligibility-input"
                    type="text"
                    value={eligibility}
                    onChange={(e) => setEligibility(e.target.value)}
                    placeholder="e.g. Open to all students with ID card"
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Organizer Contact Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="organizer@campus.edu"
                  className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {validationErrors.contactEmail && (
                  <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.contactEmail}</p>
                )}
              </div>
            </div>

            {/* Section 2: Schedule & Authoritative Venue */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">2</span>
                Schedule & Authoritative Venue
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                    Event Start (Asia/Kolkata) *
                  </label>
                  <input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (validationErrors.time) {
                        setValidationErrors(prev => ({ ...prev, time: '' }));
                      }
                    }}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validationErrors.startDate && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="end-date" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                    Event End (Asia/Kolkata) *
                  </label>
                  <input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (validationErrors.time) {
                        setValidationErrors(prev => ({ ...prev, time: '' }));
                      }
                    }}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validationErrors.endDate && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.endDate}</p>
                  )}
                </div>
              </div>
              {validationErrors.time && (
                <p className="text-rose-400 text-xs font-medium">{validationErrors.time}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="venue-alloc" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                    Authoritative Campus Venue *
                  </label>
                  <select
                    id="venue-alloc"
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.building} - Cap: {v.capacity || 'N/A'})
                      </option>
                    ))}
                  </select>
                  {validationErrors.venue && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.venue}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reg-deadline" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
                    Registration Deadline (Optional)
                  </label>
                  <input
                    id="reg-deadline"
                    type="datetime-local"
                    value={regDeadline}
                    onChange={(e) => setRegDeadline(e.target.value)}
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validationErrors.regDeadline && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.regDeadline}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Registration & Admission */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-mono font-bold">3</span>
                Registration & Capacity Requirements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cost-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Admission Fee</label>
                  <input
                    id="cost-input"
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. Free or ₹100 per team"
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="cap-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Participant Capacity</label>
                  <input
                    id="cap-input"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-400 mb-2">Registration Mechanism</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegMethod('internal')}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                      regMethod === 'internal'
                        ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30'
                        : 'bg-[#050814]/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    CampusPulse 1-Click
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegMethod('external')}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                      regMethod === 'external'
                        ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30'
                        : 'bg-[#050814]/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    External Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegMethod('none')}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition cursor-pointer ${
                      regMethod === 'none'
                        ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30'
                        : 'bg-[#050814]/80 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    Open Walk-in
                  </button>
                </div>
              </div>

              {regMethod === 'external' && (
                <div>
                  <label htmlFor="reg-url-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">External Registration URL *</label>
                  <input
                    id="reg-url-input"
                    type="url"
                    value={regUrl}
                    onChange={(e) => setRegUrl(e.target.value)}
                    placeholder="https://unstop.com/... or Google Form"
                    className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {validationErrors.regUrl && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">{validationErrors.regUrl}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="cover-url" className="block text-xs font-mono font-semibold text-slate-400 mb-2">Cover Image URL</label>
                <input
                  id="cover-url"
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-3 bg-[#050814]/80 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#050814]/80 hover:bg-[#0b1020] text-slate-200 text-xs font-bold px-5 py-3 rounded-2xl border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Save as Draft (Private)
                </button>

                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="w-full sm:w-auto bg-[#050814]/80 hover:bg-[#0b1020] text-cyan-300 text-xs font-bold px-4 py-3 rounded-2xl border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || hasHardConflict}
                className={`w-full sm:w-auto text-xs font-bold px-6 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  hasHardConflict
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-indigo-500/25'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Admin Approval →'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Clash Radar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-3xl p-6 glow-indigo sticky top-24">
              <div className="flex items-center gap-2 pb-4 border-b border-white/[0.08]">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Real-time Clash Checker</h3>
              </div>

              <div className="mt-5">
                <ClashWarningBox
                  conflictResult={activeConflictResult}
                  allowedToProceed={false}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.08] text-[11px] text-slate-400 space-y-2">
                <div className="font-bold text-white font-mono">Venue Booking Rule:</div>
                <div>• <strong className="text-slate-300">Hard Conflict:</strong> Exact venue double-booking prevents submission for administrative review.</div>
                <div>• <strong className="text-slate-300">Drafts:</strong> May be saved privately regardless of warnings.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Public Page Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 glow-indigo relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Public Event Page Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs bg-[#050814]/80 hover:bg-[#0b1020] text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>

            {/* Simulated Event Detail Header */}
            <div className="space-y-4">
              <div className="h-44 rounded-2xl overflow-hidden relative border border-white/10">
                <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-[#050814]/90 backdrop-blur text-cyan-300 border border-white/10 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {category}
                </div>
                <div className="absolute top-3 right-3 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Preview Simulation
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-indigo-400">{selectedOrg?.name || 'Club'}</span>
                <h2 className="text-xl font-black text-white mt-0.5">{title || 'Untitled Campus Event'}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#050814]/80 p-4 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{startDate ? new Date(startDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Date TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{startDate ? new Date(startDate).toLocaleTimeString('en-IN', { timeStyle: 'short' }) : 'Time TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{selectedVenue?.name || 'Venue'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span>Admission: {cost || 'Free'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">About This Event</h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {description || 'No description provided yet.'}
                </p>
              </div>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2.5 rounded-2xl transition cursor-pointer"
                >
                  Return to Form Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
