import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventCategory } from '../types';
import { detectEventConflicts } from '../lib/clashDetector';
import { ClashWarningBox } from '../components/ClashWarningBox';

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
  const { venues, organizations, events, createOrUpdateEvent } = useApp();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technology');
  const [targetAudience, setTargetAudience] = useState('All Students');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id || '');
  const [venueId, setVenueId] = useState(venues[0]?.id || '');
  
  // Dates
  const [startDate, setStartDate] = useState('2026-10-31T14:00');
  const [endDate, setEndDate] = useState('2026-10-31T17:30');
  
  // Cost & Registration
  const [cost, setCost] = useState('Free');
  const [capacity, setCapacity] = useState('150');
  const [regMethod, setRegMethod] = useState<'internal' | 'external' | 'none'>('internal');
  const [regUrl, setRegUrl] = useState('');
  const coverUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const proceedDespiteWarning = false;

  // Live Clash Detection Engine
  const startIso = startDate ? new Date(startDate).toISOString() : '';
  const endIso = endDate ? new Date(endDate).toISOString() : '';

  const activeConflicts = detectEventConflicts(
    {
      start_time: startIso,
      end_time: endIso,
      venue_id: venueId,
      category
    },
    events,
    venues
  );

  const hasHardConflict = activeConflicts.some(c => c.severity === 'hard_conflict');

  // Form Submission
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Event title is required.';
    if (!description.trim()) errors.description = 'Event description is required.';
    if (!venueId) errors.venue = 'Authoritative venue must be selected.';
    if (new Date(startDate) >= new Date(endDate)) {
      errors.time = 'Start time must be before end time.';
    }
    if (regMethod === 'external' && !regUrl.trim()) {
      errors.regUrl = 'External registration link is required.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (hasHardConflict && !isDraft) {
      setValidationErrors({
        venue: 'Cannot submit event with unresolved hard venue double-booking. Change venue or timing.'
      });
      return;
    }

    setIsSubmitting(true);

    const res = await createOrUpdateEvent({
      title,
      description,
      category,
      target_audience: targetAudience,
      organization_id: organizationId,
      venue_id: venueId,
      start_time: startIso,
      end_time: endIso,
      cost,
      capacity: Number(capacity) || undefined,
      registration_method: regMethod,
      registration_url: regUrl || undefined,
      cover_image: coverUrl,
      status: isDraft ? 'draft' : 'pending_review'
    });

    setIsSubmitting(false);
    if (res.success) {
      navigate('/organizer');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 flex items-center justify-center font-bold">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#F8FAFC]">
                Create & Publish Campus Event
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Multi-step validation with real-time schedule clash analysis as defined in P17 Blueprint Section 08.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (8 cols) */}
          <form onSubmit={(e) => handleSubmit(e, false)} className="lg:col-span-8 space-y-6">
            {/* Step 1: Basic Event Details */}
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-[#334155] pb-3">
                <span className="w-5 h-5 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center text-[10px]">1</span>
                Event Specifications
              </h2>

              <div>
                <label htmlFor="event-title" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Event Title *
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Autonomous Drone Racing League 2026"
                  className="w-full text-sm p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-2 focus:ring-[#7C5CFC]"
                />
                {validationErrors.title && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{validationErrors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="event-desc" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Detailed Description *
                </label>
                <textarea
                  id="event-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain event outcomes, agenda, prerequisites, kit requirements, and who should attend..."
                  className="w-full text-sm p-3 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-2 focus:ring-[#7C5CFC]"
                />
                {validationErrors.description && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{validationErrors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="event-cat" className="block text-xs font-semibold text-[#94A3B8] mb-1">Category</label>
                  <select
                    id="event-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="event-org" className="block text-xs font-semibold text-[#94A3B8] mb-1">Host Organization</label>
                  <select
                    id="event-org"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  >
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="target-aud" className="block text-xs font-semibold text-[#94A3B8] mb-1">Target Audience</label>
                <input
                  id="target-aud"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Open to all branches, B.Tech 2nd/3rd Year"
                  className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Step 2: Schedule & Authoritative Venue */}
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-[#334155] pb-3">
                <span className="w-5 h-5 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center text-[10px]">2</span>
                Timing & Venue Allocation
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start-date" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    Event Start (Asia/Kolkata) *
                  </label>
                  <input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label htmlFor="end-date" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                    Event End (Asia/Kolkata) *
                  </label>
                  <input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  />
                </div>
              </div>
              {validationErrors.time && (
                <p className="text-rose-400 text-xs font-medium">{validationErrors.time}</p>
              )}

              <div>
                <label htmlFor="venue-alloc" className="block text-xs font-semibold text-[#94A3B8] mb-1">
                  Authoritative Campus Venue *
                </label>
                <select
                  id="venue-alloc"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] font-medium"
                >
                  {venues.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.building} - Cap: {v.capacity || 'N/A'})
                    </option>
                  ))}
                </select>
                {validationErrors.venue && (
                  <p className="text-rose-400 text-xs mt-1 font-medium">{validationErrors.venue}</p>
                )}
                <p className="text-[11px] text-[#94A3B8] mt-1">
                  Managed via Campus Central Estate & Room Allocation Office.
                </p>
              </div>
            </div>

            {/* Step 3: Registration & Admission */}
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md space-y-4">
              <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-[#334155] pb-3">
                <span className="w-5 h-5 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center text-[10px]">3</span>
                Registration & Capacity
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cost-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">Admission Fee</label>
                  <input
                    id="cost-input"
                    type="text"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. Free or ₹100 per team"
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  />
                </div>

                <div>
                  <label htmlFor="cap-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">Participant Capacity</label>
                  <input
                    id="cap-input"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] mb-1">Registration Mechanism</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegMethod('internal')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                      regMethod === 'internal'
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#38BDF8]'
                        : 'bg-[#0B1020] border-[#334155] text-[#94A3B8]'
                    }`}
                  >
                    CampusPulse 1-Click
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegMethod('external')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                      regMethod === 'external'
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#38BDF8]'
                        : 'bg-[#0B1020] border-[#334155] text-[#94A3B8]'
                    }`}
                  >
                    External Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegMethod('none')}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                      regMethod === 'none'
                        ? 'bg-[#7C5CFC]/20 border-[#7C5CFC] text-[#38BDF8]'
                        : 'bg-[#0B1020] border-[#334155] text-[#94A3B8]'
                    }`}
                  >
                    Open Walk-in
                  </button>
                </div>
              </div>

              {regMethod === 'external' && (
                <div>
                  <label htmlFor="reg-url-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">External Registration URL *</label>
                  <input
                    id="reg-url-input"
                    type="url"
                    value={regUrl}
                    onChange={(e) => setRegUrl(e.target.value)}
                    placeholder="https://unstop.com/... or Google Form"
                    className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
                  />
                  {validationErrors.regUrl && (
                    <p className="text-rose-400 text-xs mt-1 font-medium">{validationErrors.regUrl}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
                className="bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] text-xs font-bold px-5 py-3 rounded-xl border border-[#334155] transition"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (hasHardConflict && !proceedDespiteWarning)}
                className={`text-xs font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-lg ${
                  hasHardConflict
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-[#334155]'
                    : 'bg-[#7C5CFC] hover:bg-[#6B46E5] text-white'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Admin Approval →'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Clash Checker Radar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-md sticky top-20">
              <div className="flex items-center gap-2 pb-3 border-b border-[#334155]">
                <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="font-bold text-[#F8FAFC] text-sm">Real-time Clash Checker</h3>
              </div>

              <div className="mt-4">
                <ClashWarningBox
                  conflicts={activeConflicts}
                  allowedToProceed={proceedDespiteWarning}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-[#334155] text-[11px] text-[#94A3B8] space-y-2">
                <div className="font-bold text-[#F8FAFC]">Conflict Rules Applied:</div>
                <div>• <strong>Hard Conflict:</strong> Exact venue double-booking is blocked.</div>
                <div>• <strong>Strong Warning:</strong> Same audience/category window allows submission with justification.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
