import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Bookmark, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Mail, 
  ExternalLink,
  ChevronLeft,
  Flag,
  Users,
  ShieldCheck,
  AlertCircle,
  Zap,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateICS } from '../lib/icsExport';
import { Button, Badge, Dialog, Toast, EmptyState } from '../components/ui';
import { EventCard } from '../components/EventCard';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    events, 
    toggleSaveEvent, 
    isEventSaved, 
    registerForEvent, 
    isEventRegistered,
    currentUser,
    canManageEvent
  } = useApp();

  const [registering, setRegistering] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_details');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Retrieve target event
  const rawEvent = events.find(e => e.id === id);

  // Database-grade public visibility enforcement:
  // Unapproved events (draft, pending_review, changes_requested, rejected)
  // are invisible to public visitors and students unless user is an authorized organizer of that club or admin.
  const isAuthorizedViewer = rawEvent ? (
    ['published', 'completed', 'cancelled'].includes(rawEvent.status) ||
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'organizer' && canManageEvent(rawEvent, currentUser.id))
  ) : false;

  const event = isAuthorizedViewer ? rawEvent : null;

  // 1. Not Found Recovery State
  if (!event) {
    return (
      <div className="min-h-screen text-slate-100 py-16 px-4">
        <EmptyState
          title="Event Not Found or Access Restricted"
          description="The event listing you requested does not exist, is currently an unapproved private draft, or has not completed administrative review."
          actionLabel="Return to Event Directory"
          onAction={() => window.location.href = '/discover'}
        />
      </div>
    );
  }

  const saved = isEventSaved(event.id);
  const registered = isEventRegistered(event.id);

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const deadline = event.registration_deadline ? new Date(event.registration_deadline) : null;
  const isPastDeadline = deadline ? new Date().getTime() > deadline.getTime() : false;
  const isCompleted = new Date().getTime() > endDate.getTime();

  const dateFormatted = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeFormatted = `${startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  // Related events (same category or same organizer, excluding current)
  const relatedEvents = events
    .filter(e => e.id !== event.id && e.status === 'published' && (e.category === event.category || e.organization_id === event.organization_id))
    .slice(0, 3);

  // Actions
  const handleRegister = async () => {
    setRegistering(true);
    const res = await registerForEvent(event.id, 'Confirmed attendance via CampusPulse Portal');
    if (res.success) {
      setToastMessage({ type: 'success', text: res.message });
    } else {
      setToastMessage({ type: 'error', text: res.message });
    }
    setRegistering(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage({ type: 'success', text: 'Event URL copied to clipboard! Shareable on WhatsApp and email.' });
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setReportNotes('');
      setToastMessage({ type: 'success', text: 'Integrity report submitted to Campus Administration for review.' });
    }, 1000);
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-[#C7F36B] transition"
          >
            <ChevronLeft className="w-4 h-4" /> BACK TO EVENT CATALOGUE
          </Link>

          <button
            onClick={() => setReportModalOpen(true)}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" /> Report Incorrect Details
          </button>
        </div>

        {/* Status Banners */}
        {event.status === 'cancelled' && (
          <aside aria-label="Event cancellation notice" className="glass-card border-l-4 border-l-rose-500 p-5 rounded-3xl text-rose-200">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              This event has been officially cancelled by the organizers.
            </div>
            <p className="text-xs text-rose-300/80 mt-1 pl-7">
              Registered participants will not need to attend. Room booking has been released by Campus Estate.
            </p>
          </aside>
        )}

        {isCompleted && event.status !== 'cancelled' && (
          <aside aria-label="Event completed notice" className="glass-card border-l-4 border-l-slate-500 p-5 rounded-3xl text-slate-300">
            <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              This event has concluded.
            </div>
            <p className="text-xs text-slate-400 mt-1 pl-7">
              Check the host club page for post-event highlights, recordings, and slides.
            </p>
          </aside>
        )}

        {/* ABOVE-THE-FOLD CARD */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          {/* Cover Media with Gradient Overlay */}
          <div className="relative h-64 sm:h-96 w-full bg-[#090D1A]">
            <img
              src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-[#090D1A]/60 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#101828]/90 text-white border border-white/20">
                  {event.category}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40">
                  {event.cost} Admission
                </span>
                {event.status === 'published' && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved Listing
                  </span>
                )}
                {event.status === 'cancelled' && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Cancelled
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-300">
                <span>Organized by</span>
                <span className="font-bold text-white underline decoration-indigo-400/50 underline-offset-4">{event.organization?.name}</span>
                {event.organization?.is_verified && (
                  <span className="text-[10px] font-mono bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Chapter
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Schedule Grid (Date, Time, Venue) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-white/[0.08] bg-[#090D1A]/80 p-6 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#C7F36B]/15 border border-[#C7F36B]/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#C7F36B] shrink-0" />
              </div>
              <div>
                <div className="font-semibold text-white">{dateFormatted}</div>
                <div className="text-[11px] font-mono text-slate-400">Event Date</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-indigo-400 shrink-0" />
              </div>
              <div>
                <div className="font-semibold text-white font-mono">{timeFormatted}</div>
                <div className="text-[11px] font-mono text-slate-400">Time Window ({event.timezone})</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
              </div>
              <div>
                <div className="font-semibold text-white">{event.venue?.name}</div>
                <div className="text-[11px] text-slate-400">{event.venue?.building} · {event.venue?.location}</div>
              </div>
            </div>
          </div>

          {/* Primary Action Ribbon */}
          <div className="p-6 bg-[#101828]/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Registration CTAs */}
              {event.status === 'cancelled' ? (
                <Button variant="secondary" disabled>
                  Registrations Inactive (Event Cancelled)
                </Button>
              ) : isCompleted ? (
                <Button variant="secondary" disabled>
                  Event Ended
                </Button>
              ) : isPastDeadline ? (
                <Button variant="secondary" disabled>
                  Registration Closed
                </Button>
              ) : event.registration_method === 'external' ? (
                <div className="space-y-1">
                  <a
                    href={event.registration_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button variant="gradient" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Register on External Portal
                    </Button>
                  </a>
                  <p className="text-[10px] text-slate-400">
                    Handled by external platform; link click does not confirm attendance in CampusPulse.
                  </p>
                </div>
              ) : event.registration_method === 'none' ? (
                <div className="bg-black/40 text-slate-300 font-semibold px-4 py-2.5 rounded-2xl text-xs border border-white/10">
                  Open Walk-In (No prior registration required)
                </div>
              ) : registered ? (
                <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Confirmed Seat Pass
                </div>
              ) : (
                <Button
                  variant="gradient"
                  isLoading={registering}
                  onClick={handleRegister}
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-[#C7F36B] text-slate-950 font-extrabold"
                >
                  Register for Event (1-Click Pass)
                </Button>
              )}

              {/* Bookmark Save Action */}
              <Button
                variant={saved ? 'primary' : 'secondary'}
                onClick={() => {
                  toggleSaveEvent(event.id);
                  setToastMessage({
                    type: 'success',
                    text: saved ? 'Removed from your saved schedule.' : 'Saved to your personal calendar schedule!'
                  });
                }}
                className="gap-2"
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-[#C7F36B]' : 'text-slate-400'}`} />
                <span>{saved ? 'Saved in Agenda' : 'Save Event'}</span>
              </Button>

              {/* Add to Calendar (.ics) Export */}
              <Button
                variant="secondary"
                onClick={() => {
                  generateICS(event);
                  setToastMessage({ type: 'success', text: 'Downloaded .ics calendar file for Apple/Google/Outlook Calendar.' });
                }}
                className="gap-2"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Add to Calendar (.ics)</span>
              </Button>
            </div>

            {/* Share Trigger */}
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-slate-300 hover:text-white">
              <Share2 className="w-4 h-4 text-[#C7F36B]" />
              <span>Share Event</span>
            </Button>
          </div>

          {/* Deep Content Section */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-white mb-3">About This Experience</h2>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Structured Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/[0.08] text-xs">
              <div>
                <h3 className="font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Target Audience</h3>
                <span className="font-semibold text-white bg-black/40 px-3.5 py-2 rounded-xl inline-block border border-white/10">
                  {event.target_audience}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Capacity</h3>
                <span className="font-semibold text-white bg-black/40 px-3.5 py-2 rounded-xl inline-block border border-white/10">
                  {event.capacity ? `${event.capacity} Attendees Limit` : 'Open Campus Hall'}
                </span>
              </div>

              <div>
                <h3 className="font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">Registration Deadline</h3>
                <span className="font-semibold text-white bg-black/40 px-3.5 py-2 rounded-xl inline-block border border-white/10">
                  {deadline ? deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Until Event Start'}
                </span>
              </div>
            </div>

            {/* Tags Ribbon */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-4 border-t border-white/[0.08]">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">Category Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(t => (
                    <span key={t} className="text-xs font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium px-3 py-1 rounded-xl">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Host Club Details Card */}
            <div className="pt-6 border-t border-white/[0.08]">
              <div className="bg-black/40 p-6 rounded-3xl border border-white/10 flex items-start gap-4">
                <img
                  src={event.organization?.logo_url || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80'}
                  alt={event.organization?.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{event.organization?.name}</h3>
                    {event.organization?.is_verified && (
                      <span className="text-[10px] font-mono bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Official Campus Chapter
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {event.organization?.description}
                  </p>
                  <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" /> {event.organization?.contact_email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-400" /> Lead: {event.organization?.lead_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RELATED EVENTS SECTION */}
        {relatedEvents.length > 0 && (
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C7F36B]">More Experiences</span>
                <h2 className="text-2xl font-bold text-white mt-1">Related Campus Events</h2>
              </div>
              <Link to="/discover" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition underline">
                View all in {event.category} →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedEvents.map(rel => (
                <EventCard key={rel.id} event={rel} compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal Dialog */}
      <Dialog
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Outdated or Incorrect Listing"
        description="Help campus administration maintain accurate room allocations and event dates."
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label htmlFor="report-reason" className="block text-xs font-mono font-bold text-slate-400 mb-2">Issue Type</label>
            <select
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs p-3 bg-black/50 border border-white/15 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-[#C7F36B]"
            >
              <option value="incorrect_details">Incorrect Timings or Date</option>
              <option value="venue_changed">Room/Venue Moved or Cancelled</option>
              <option value="cancelled_unannounced">Event Not Happening</option>
              <option value="spam">Spam or Duplicate Listing</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-notes" className="block text-xs font-mono font-bold text-slate-400 mb-2">Additional Details</label>
            <textarea
              id="report-notes"
              rows={3}
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Explain what is inaccurate (e.g. Venue moved to Block 28)..."
              className="w-full text-xs p-3 bg-black/50 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#C7F36B]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={reportSubmitted}>
              Submit Report
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Floating Status Toast */}
      {toastMessage && (
        <Toast
          type={toastMessage.type}
          message={toastMessage.text}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
