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
  FileText,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventCategory } from '../types';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';
import { StatusTimeline } from '../components/StatusTimeline';
import { Button } from '../components/ui';

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

  // Wizard active step (1 to 7)
  const [currentStep, setCurrentStep] = useState(1);

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
  const [eventStatus, setEventStatus] = useState<string>('draft');
  const [createdAtDate, setCreatedAtDate] = useState<string>('');
  const [updatedAtDate, setUpdatedAtDate] = useState<string>('');
  
  // Dates & Timing
  const [startDate, setStartDate] = useState('2026-11-15T14:00');
  const [endDate, setEndDate] = useState('2026-11-15T17:30');
  const [regDeadline, setRegDeadline] = useState('2026-11-14T23:59');
  const [timezone] = useState('Asia/Kolkata');
  
  // Cost & Registration
  const [cost, setCost] = useState('Free');
  const [capacity, setCapacity] = useState('150');
  const [regMethod, setRegMethod] = useState<'internal' | 'external' | 'none'>('internal');
  const [regUrl, setRegUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80');

  // Competition & Challenge optional fields
  const [teamSizeMin, setTeamSizeMin] = useState('1');
  const [teamSizeMax, setTeamSizeMax] = useState('4');
  const [prizeDetails, setPrizeDetails] = useState('1st: ₹25,000 | 2nd: ₹15,000 | Certificate of Merit');

  // Status & Validation
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthorizedToCreate = currentUser?.role === 'organizer' || currentUser?.role === 'admin';

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = events.find(e => e.id === id);
      if (existing) {
        if (!canManageEvent(existing, currentUser?.id)) {
          setGeneralError('Access denied: You are not authorized to edit this event record.');
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
      }
    }
  }, [isEditing, id, events, currentUser, canManageEvent]);

  useEffect(() => {
    if (!organizationId && authorizedOrgs.length > 0) {
      setOrganizationId(authorizedOrgs[0].id);
    }
  }, [authorizedOrgs, organizationId]);

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
    id
  );

  const hasHardConflict = activeConflictResult.has_hard_conflict;

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!title.trim()) errors.title = 'Event title is required.';
      if (!organizationId) errors.organization = 'Authorized host club is required.';
    }

    if (currentStep === 2) {
      if (!description.trim()) errors.description = 'Event description is required.';
    }

    if (currentStep === 3) {
      if (!startDate) errors.startDate = 'Start date and time are required.';
      if (!endDate) errors.endDate = 'End date and time are required.';
      if (startDate && endDate) {
        const s = new Date(startDate);
        const en = new Date(endDate);
        if (en <= s) {
          errors.time = 'End time must be strictly after start time.';
        }
      }
    }

    if (currentStep === 4) {
      if (!venueId) errors.venue = 'Authoritative venue must be selected.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 7));
    }
  };

  const handleSubmit = async (isDraft = false) => {
    setGeneralError(null);

    if (hasHardConflict && !isDraft) {
      setValidationErrors({
        venue: 'Cannot submit for approval with an unresolved venue collision. Choose an alternate venue or timing.'
      });
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...(id ? { id } : {}),
      title: title.trim() || 'Untitled Campus Event',
      description: description.trim() || 'No description provided.',
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
      status: isDraft ? 'draft' as const : 'pending_review' as const,
      competition_details: category === 'Technology' ? {
        eligibility_criteria: eligibility,
        team_size_min: Number(teamSizeMin) || 1,
        team_size_max: Number(teamSizeMax) || 4,
        prizes: [{ rank: 'Winners Podium', reward: prizeDetails }]
      } : undefined
    };

    const res = await createOrUpdateEvent(payload);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/organizer');
    } else {
      setGeneralError(res.error || 'Failed to submit event proposal.');
    }
  };

  const selectedVenue = venues.find(v => v.id === venueId);
  const selectedOrg = authorizedOrgs.find(o => o.id === organizationId);

  if (!isAuthorizedToCreate) {
    return (
      <div className="min-h-screen text-[#11152B] py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#11152B]">Access Restricted</h2>
          <p className="text-xs text-[#687087] mt-2 leading-relaxed">
            Only registered student organizers and administrators have authorization to propose events.
          </p>
          <div className="mt-6">
            <Link to="/home">
              <Button variant="primary">Return to Student Portal</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = [
    'Basic Info',
    'Description',
    'Date & Time',
    'Venue & Clashes',
    'Cover Media',
    'Optional Specs',
    'Review & Submit'
  ];

  return (
    <div className="min-h-screen text-[#11152B] py-10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/organizer"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#687087] hover:text-[#5145E5] transition"
          >
            <ArrowLeft className="w-4 h-4" /> BACK TO ORGANIZER STUDIO
          </Link>
          <span className="text-xs font-mono font-bold text-[#5145E5] bg-[#F0EDFF] px-3 py-1 rounded-full">
            7-Step Event Wizard
          </span>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="bg-white rounded-3xl p-6 border border-[#E7E9F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold text-[#11152B]">
              {isEditing ? 'Edit Event Proposal' : 'Propose New Campus Event'}
            </h1>
            <span className="text-xs font-mono font-bold text-[#5145E5]">
              Step {currentStep} of 7: {stepLabels[currentStep - 1]}
            </span>
          </div>

          <div className="w-full bg-[#F7F8FC] h-2.5 rounded-full overflow-hidden border border-[#E7E9F0]">
            <div 
              className="bg-[#5145E5] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-1 text-[11px] font-mono text-center pt-1 text-[#687087]">
            {stepLabels.map((lbl, idx) => (
              <span 
                key={lbl} 
                className={`truncate ${idx + 1 === currentStep ? 'font-bold text-[#5145E5]' : idx + 1 < currentStep ? 'text-[#16A36A]' : 'text-[#9299AA]'}`}
              >
                {idx + 1}. {lbl}
              </span>
            ))}
          </div>
        </div>

        {generalError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {generalError}
          </div>
        )}

        {/* STEP CONTENT PANELS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9F0] shadow-xs space-y-6">
          
          {/* STEP 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                1. Basic Event Information
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Event Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. HackCampus 2026: AI & Systems Hackathon"
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B] font-semibold"
                />
                {validationErrors.title && <p className="text-rose-600 text-xs mt-1">{validationErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Host Organization / Chapter *</label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B] font-semibold"
                >
                  {authorizedOrgs.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
                  ))}
                </select>
                {validationErrors.organization && <p className="text-rose-600 text-xs mt-1">{validationErrors.organization}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Category Track *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B] font-semibold"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Description and Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                2. Event Description & Audience
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Comprehensive Description *</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the purpose, agenda, requirements, and outcomes for attending students..."
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                />
                {validationErrors.description && <p className="text-rose-600 text-xs mt-1">{validationErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. B.Tech 2nd/3rd Year, All Students"
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="organizer@campus.edu"
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Date and Time Controls */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                3. Date & Time Window
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">Start Time (Asia/Kolkata) *</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">End Time (Asia/Kolkata) *</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
              </div>
              {validationErrors.time && <p className="text-rose-600 text-xs">{validationErrors.time}</p>}

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Registration Cutoff Deadline</label>
                <input
                  type="datetime-local"
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Authoritative Venue & Clash Radar */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                4. Venue Selection & Zero-Clash Radar
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Select Campus Venue *</label>
                <select
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B] font-semibold"
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.building}) — Capacity: {v.capacity || 'Open'}
                    </option>
                  ))}
                </select>
                {validationErrors.venue && <p className="text-rose-600 text-xs mt-1">{validationErrors.venue}</p>}
              </div>

              {/* Clash Detection Radar Result Box */}
              <div className="pt-2">
                <ClashWarningBox
                  conflictResult={activeConflictResult}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Cover Image & Media */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                5. Event Banner & Media Cover
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#11152B] mb-1">Image URL</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                />
              </div>

              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-[#F0EDFF] border border-[#E7E9F0]">
                <img 
                  src={coverUrl} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#11152B]">
                  Live Media Preview
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Optional Hackathon & Competition Specifications */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                6. Challenge Guidelines & Optional Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">Admission Cost</label>
                  <input
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. Free, ₹150"
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#11152B] mb-1">Participant Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="150"
                    className="w-full text-xs p-3.5 bg-[#F7F8FC] border border-[#E7E9F0] rounded-xl text-[#11152B]"
                  />
                </div>
              </div>

              {category === 'Technology' && (
                <div className="p-4 rounded-2xl bg-[#F0EDFF]/50 border border-[#5145E5]/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5145E5]">
                    <Trophy className="w-4 h-4" />
                    <span>Hackathon / Challenge Specifications</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#11152B] mb-1">Min Team Size</label>
                      <input
                        type="number"
                        value={teamSizeMin}
                        onChange={(e) => setTeamSizeMin(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E7E9F0] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#11152B] mb-1">Max Team Size</label>
                      <input
                        type="number"
                        value={teamSizeMax}
                        onChange={(e) => setTeamSizeMax(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E7E9F0] rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#11152B] mb-1">Prize Breakdown & Rewards</label>
                    <input
                      type="text"
                      value={prizeDetails}
                      onChange={(e) => setPrizeDetails(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#E7E9F0] rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Review & Submission */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-page-enter">
              <h2 className="text-base font-extrabold text-[#11152B] border-b border-[#E7E9F0] pb-2">
                7. Review Summary & Clearance Submission
              </h2>

              <div className="p-5 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#11152B]">{title}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#5145E5] font-bold font-mono">
                    {category}
                  </span>
                </div>
                <div className="text-[#687087]">
                  <strong>Host:</strong> {selectedOrg?.name} · <strong>Venue:</strong> {selectedVenue?.name}
                </div>
                <div className="text-[#687087]">
                  <strong>Window:</strong> {new Date(startDate).toLocaleString('en-IN')} – {new Date(endDate).toLocaleString('en-IN')}
                </div>
                <div className="text-[#687087]">
                  <strong>Pass Fee:</strong> {cost} · <strong>Capacity:</strong> {capacity} Seats
                </div>
              </div>

              {hasHardConflict ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Hard venue clash detected. You must adjust time or venue in Step 4 before submitting for approval.</span>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Clearance Radar: No physical venue collisions. Ready for Dean Review.</span>
                </div>
              )}
            </div>
          )}

          {/* WIZARD NAVIGATION CONTROLS */}
          <div className="pt-6 border-t border-[#E7E9F0] flex items-center justify-between">
            <Button
              variant="secondary"
              size="md"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
              className="border-[#E7E9F0]"
            >
              Previous Step
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => handleSubmit(true)}
                isLoading={isSubmitting}
                className="border-[#E7E9F0]"
              >
                Save as Draft
              </Button>

              {currentStep < 7 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleNextStep}
                  className="gap-1.5 bg-[#5145E5] hover:bg-[#4338CA]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSubmit(false)}
                  disabled={hasHardConflict}
                  isLoading={isSubmitting}
                  className="gap-1.5 bg-[#16A36A] hover:bg-[#15803D] text-white font-bold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit for Dean Clearance</span>
                </Button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default CreateEventPage;
