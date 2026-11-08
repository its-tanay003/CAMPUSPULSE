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
  Zap,
  Sparkles,
  Trophy,
  List,
  HelpCircle,
  Megaphone,
  Star,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportEventToCalendar } from '../lib/calendarExport';
import { Button, Dialog, Toast, EmptyState } from '../components/ui';
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
    canManageEvent,
    addEventAnnouncement,
    submitEventFeedback,
    feedbacks
  } = useApp();

  const [registering, setRegistering] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_details');
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Announcement Modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'update' | 'venue_change' | 'timing_change' | 'important'>('update');

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Active section tab
  const [detailTab, setDetailTab] = useState<'overview' | 'agenda' | 'competition' | 'announcements' | 'reviews'>('overview');

  const rawEvent = events.find(e => e.id === id);

  const isAuthorizedViewer = rawEvent ? (
    ['published', 'completed', 'cancelled'].includes(rawEvent.status) ||
    currentUser?.role === 'admin' ||
    (currentUser?.role === 'organizer' && canManageEvent(rawEvent, currentUser.id))
  ) : false;

  const event = isAuthorizedViewer ? rawEvent : null;

  if (!event) {
    return (
      <div className="min-h-screen text-[#11152B] py-16 px-4">
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
  const canOrganize = canManageEvent(event, currentUser?.id);

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

  const relatedEvents = events
    .filter(e => e.id !== event.id && e.status === 'published' && (e.category === event.category || e.organization_id === event.organization_id))
    .slice(0, 3);

  const eventFeedbacks = feedbacks.filter(f => f.event_id === event.id);

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

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annMessage) return;
    await addEventAnnouncement(event.id, annTitle, annMessage, annType);
    setAnnouncementModalOpen(false);
    setAnnTitle('');
    setAnnMessage('');
    setToastMessage({ type: 'success', text: 'Announcement broadcasted to all registered attendees!' });
  };

  const handlePostFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackComment) return;
    await submitEventFeedback(event.id, feedbackRating, feedbackComment);
    setFeedbackSubmitted(true);
    setFeedbackComment('');
    setToastMessage({ type: 'success', text: 'Thank you! Your feedback has been recorded.' });
  };

  return (
    <div className="min-h-screen text-[#11152B] py-10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#687087] hover:text-[#5145E5] transition"
          >
            <ChevronLeft className="w-4 h-4" /> BACK TO EVENT DIRECTORY
          </Link>

          <div className="flex items-center gap-3">
            {canOrganize && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAnnouncementModalOpen(true)}
                className="gap-1.5 text-xs border-[#E7E9F0]"
              >
                <Megaphone className="w-3.5 h-3.5 text-[#5145E5]" />
                Post Announcement
              </Button>
            )}

            <button
              onClick={() => setReportModalOpen(true)}
              className="text-xs text-[#9299AA] hover:text-rose-600 font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" /> Report Issue
            </button>
          </div>
        </div>

        {/* Status Banners */}
        {event.status === 'cancelled' && (
          <aside aria-label="Event cancellation notice" className="bg-rose-50 border border-rose-200 p-5 rounded-3xl text-rose-900">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-700">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              This event has been officially cancelled by the organizers.
            </div>
            <p className="text-xs text-rose-800 mt-1 pl-7">
              Registered participants will not need to attend. Room booking has been released by Campus Administration.
            </p>
          </aside>
        )}

        {isCompleted && event.status !== 'cancelled' && (
          <aside aria-label="Event completed notice" className="bg-slate-100 border border-slate-200 p-5 rounded-3xl text-slate-700">
            <div className="flex items-center gap-2 font-bold text-sm text-[#11152B]">
              <CheckCircle2 className="w-5 h-5 text-[#16A36A]" />
              This event has concluded.
            </div>
            <p className="text-xs text-[#687087] mt-1 pl-7">
              Check the host club page for post-event highlights, recordings, and slides.
            </p>
          </aside>
        )}

        {/* ABOVE-THE-FOLD CARD */}
        <div className="bg-white rounded-3xl overflow-hidden border border-[#E7E9F0] shadow-sm">
          {/* Cover Media with Gradient Overlay */}
          <div className="relative h-64 sm:h-96 w-full bg-[#F0EDFF]">
            <img
              src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11152B]/85 via-[#11152B]/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-white/95 text-[#11152B]">
                  {event.category}
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#5145E5] text-white">
                  {event.cost} Pass
                </span>
                {event.status === 'published' && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#16A36A] text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {event.status === 'cancelled' && (
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#E5484D] text-white">
                    Cancelled
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                <span>Organized by</span>
                <Link to={`/clubs/${event.organization_id}`} className="font-bold text-white underline decoration-[#C8F169] underline-offset-4 hover:text-[#C8F169]">
                  {event.organization?.name}
                </Link>
                {event.organization?.is_verified && (
                  <span className="text-[10px] font-mono bg-[#16A36A]/20 text-[#C8F169] border border-[#C8F169]/40 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Chapter
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Schedule Grid (Date, Time, Venue) */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-[#E7E9F0] bg-[#F7F8FC] p-6 gap-4 text-xs sm:text-sm text-[#687087]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0EDFF] border border-[#5145E5]/20 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#5145E5] shrink-0" />
              </div>
              <div>
                <div className="font-bold text-[#11152B]">{dateFormatted}</div>
                <div className="text-[11px] font-mono text-[#9299AA]">Event Date</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0EDFF] border border-[#5145E5]/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#5145E5] shrink-0" />
              </div>
              <div>
                <div className="font-bold text-[#11152B] font-mono">{timeFormatted}</div>
                <div className="text-[11px] font-mono text-[#9299AA]">Time Window ({event.timezone})</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F0EDFF] border border-[#5145E5]/20 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#5145E5] shrink-0" />
              </div>
              <div>
                <div className="font-bold text-[#11152B]">{event.venue?.name}</div>
                <div className="text-[11px] text-[#687087]">{event.venue?.building} · {event.venue?.location}</div>
              </div>
            </div>
          </div>

          {/* Primary Action Ribbon */}
          <div className="p-6 bg-white border-b border-[#E7E9F0] flex flex-wrap items-center justify-between gap-4">
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
                <a
                  href={event.registration_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="primary" className="gap-2 bg-[#5145E5] hover:bg-[#4338CA]">
                    <ExternalLink className="w-4 h-4" />
                    Register on External Portal
                  </Button>
                </a>
              ) : registered ? (
                <div className="bg-[#16A36A]/10 border border-[#16A36A]/30 text-[#16A36A] font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                  Confirmed Admission Pass
                </div>
              ) : (
                <Button
                  variant="primary"
                  isLoading={registering}
                  onClick={handleRegister}
                  className="gap-2 bg-[#5145E5] hover:bg-[#4338CA] text-white font-bold"
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
                className={`gap-2 ${saved ? 'bg-[#5145E5] text-[#C8F169]' : 'border-[#E7E9F0]'}`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current text-[#C8F169]' : 'text-[#687087]'}`} />
                <span>{saved ? 'Saved in Pass Wallet' : 'Save Event'}</span>
              </Button>

              {/* Add to Calendar (.ics) Export */}
              <Button
                variant="secondary"
                onClick={() => {
                  exportEventToCalendar(event);
                  setToastMessage({ type: 'success', text: 'Downloaded .ics calendar file for Apple/Google Calendar.' });
                }}
                className="gap-2 border-[#E7E9F0]"
              >
                <Download className="w-4 h-4 text-[#5145E5]" />
                <span>Export .ics</span>
              </Button>
            </div>

            {/* Share Trigger */}
            <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 text-[#687087] hover:text-[#5145E5]">
              <Share2 className="w-4 h-4 text-[#5145E5]" />
              <span>Share Event</span>
            </Button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex gap-2 border-b border-[#E7E9F0] px-6 pt-3 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setDetailTab('overview')}
              className={`px-4 py-2 border-b-2 transition cursor-pointer shrink-0 ${
                detailTab === 'overview'
                  ? 'border-[#5145E5] text-[#5145E5] font-bold'
                  : 'border-transparent text-[#687087] hover:text-[#11152B]'
              }`}
            >
              Overview & Specs
            </button>
            <button
              onClick={() => setDetailTab('agenda')}
              className={`px-4 py-2 border-b-2 transition cursor-pointer shrink-0 ${
                detailTab === 'agenda'
                  ? 'border-[#5145E5] text-[#5145E5] font-bold'
                  : 'border-transparent text-[#687087] hover:text-[#11152B]'
              }`}
            >
              Agenda & Speakers
            </button>
            <button
              onClick={() => setDetailTab('competition')}
              className={`px-4 py-2 border-b-2 transition cursor-pointer shrink-0 ${
                detailTab === 'competition'
                  ? 'border-[#5145E5] text-[#5145E5] font-bold'
                  : 'border-transparent text-[#687087] hover:text-[#11152B]'
              }`}
            >
              Rules & Guidelines
            </button>
            <button
              onClick={() => setDetailTab('announcements')}
              className={`px-4 py-2 border-b-2 transition cursor-pointer shrink-0 ${
                detailTab === 'announcements'
                  ? 'border-[#5145E5] text-[#5145E5] font-bold'
                  : 'border-transparent text-[#687087] hover:text-[#11152B]'
              }`}
            >
              Live Announcements ({event.announcements?.length || 0})
            </button>
            <button
              onClick={() => setDetailTab('reviews')}
              className={`px-4 py-2 border-b-2 transition cursor-pointer shrink-0 ${
                detailTab === 'reviews'
                  ? 'border-[#5145E5] text-[#5145E5] font-bold'
                  : 'border-transparent text-[#687087] hover:text-[#11152B]'
              }`}
            >
              Feedback & Ratings ({eventFeedbacks.length})
            </button>
          </div>

          {/* Deep Content Section based on selected tab */}
          <div className="p-6 sm:p-8 space-y-8">
            {detailTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#11152B] mb-2">About This Experience</h2>
                  <p className="text-[#687087] leading-relaxed text-sm whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {/* Structured Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E7E9F0] text-xs">
                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]">
                    <span className="font-mono font-bold text-[#9299AA] uppercase tracking-wider block mb-1">Target Audience</span>
                    <span className="font-bold text-[#11152B]">{event.target_audience}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]">
                    <span className="font-mono font-bold text-[#9299AA] uppercase tracking-wider block mb-1">Room Capacity</span>
                    <span className="font-bold text-[#11152B]">{event.capacity ? `${event.capacity} Attendees Limit` : 'Open Campus Hall'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0]">
                    <span className="font-mono font-bold text-[#9299AA] uppercase tracking-wider block mb-1">Pass Deadline</span>
                    <span className="font-bold text-[#11152B]">{deadline ? deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Until Event Start'}</span>
                  </div>
                </div>

                {/* Host Club Details Card */}
                <div className="pt-4 border-t border-[#E7E9F0]">
                  <div className="bg-[#F7F8FC] p-6 rounded-3xl border border-[#E7E9F0] flex items-start gap-4">
                    <img
                      src={event.organization?.logo_url || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80'}
                      alt={event.organization?.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#E7E9F0] shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link to={`/clubs/${event.organization_id}`} className="font-bold text-[#11152B] text-base hover:text-[#5145E5]">
                          {event.organization?.name}
                        </Link>
                        {event.organization?.is_verified && (
                          <span className="text-[10px] font-mono bg-[#16A36A]/10 text-[#16A36A] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Chartered Chapter
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#687087] mt-1.5 leading-relaxed">
                        {event.organization?.description}
                      </p>
                      <div className="mt-3.5 flex flex-wrap items-center gap-4 text-xs text-[#687087]">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#5145E5]" /> {event.organization?.contact_email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#5145E5]" /> Lead: {event.organization?.lead_name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'agenda' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#11152B] mb-1">Session Schedule & Flow</h2>
                  <p className="text-xs text-[#687087]">Official agenda planned by the organizing committee.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-[#5145E5] bg-[#F0EDFF] px-2.5 py-1 rounded-xl shrink-0">
                      Phase 01
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-[#11152B]">Participant Welcome & Badge Issuance</div>
                      <p className="text-xs text-[#687087]">Verification of student campus identity and seat assignment at the venue reception.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-[#5145E5] bg-[#F0EDFF] px-2.5 py-1 rounded-xl shrink-0">
                      Phase 02
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-[#11152B]">Keynote Presentation & Demonstration</div>
                      <p className="text-xs text-[#687087]">Main stage presentation, technical breakdown, and interactive student Q&A.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] flex items-start gap-4">
                    <span className="font-mono text-xs font-bold text-[#5145E5] bg-[#F0EDFF] px-2.5 py-1 rounded-xl shrink-0">
                      Phase 03
                    </span>
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-[#11152B]">Evaluation, Networking & Certificate Distribution</div>
                      <p className="text-xs text-[#687087]">Final project assessments, peer networking, and issuance of participation credentials.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'competition' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#11152B] mb-1">Participation Guidelines & Eligibility</h2>
                  <p className="text-xs text-[#687087]">Rules approved by Campus Student Welfare and Dean Governance.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-2">
                    <span className="font-bold text-xs text-[#11152B] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[#5145E5]" /> Eligibility Criteria
                    </span>
                    <p className="text-xs text-[#687087] leading-relaxed">
                      Open to all registered undergraduate, postgraduate, and diploma students carrying valid university biometric ID cards.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-2">
                    <span className="font-bold text-xs text-[#11152B] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#16A36A]" /> Academic Integrity & Conduct
                    </span>
                    <p className="text-xs text-[#687087] leading-relaxed">
                      Zero tolerance for plagiarism in project code or unverified external submissions. University honor code strictly applies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'announcements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-[#11152B] mb-1">Organizer Broadcasts</h2>
                    <p className="text-xs text-[#687087]">Live notices published directly by the event coordinator.</p>
                  </div>
                  {canOrganize && (
                    <Button variant="primary" size="sm" onClick={() => setAnnouncementModalOpen(true)} className="bg-[#5145E5] text-xs">
                      + Add Notice
                    </Button>
                  )}
                </div>

                {event.announcements && event.announcements.length > 0 ? (
                  <div className="space-y-3">
                    {event.announcements.map(ann => (
                      <div key={ann.id} className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#11152B] flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-[#5145E5]" />
                            {ann.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#9299AA]">
                            {new Date(ann.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-[#687087] leading-relaxed">{ann.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Announcements Posted"
                    description="No schedule changes or room notices have been issued for this event yet."
                  />
                )}
              </div>
            )}

            {detailTab === 'reviews' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-extrabold text-[#11152B] mb-1">Student Feedback & Reviews</h2>
                  <p className="text-xs text-[#687087]">Verified feedback from enrolled campus attendees.</p>
                </div>

                {/* Submit Feedback Form */}
                {currentUser && (
                  <form onSubmit={handlePostFeedback} className="p-5 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-3">
                    <span className="text-xs font-bold text-[#11152B] block">Leave your feedback</span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#687087]">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= feedbackRating ? 'text-amber-500 fill-amber-500' : 'text-[#D1D5E4]'}`} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your experience (e.g. well-structured session, great venue setup)..."
                      className="w-full text-xs p-3 bg-white border border-[#E7E9F0] rounded-xl text-[#11152B] placeholder-[#9299AA] focus:outline-none focus:ring-2 focus:ring-[#5145E5]"
                    />

                    <div className="flex justify-end">
                      <Button variant="primary" size="sm" type="submit" className="gap-1.5 bg-[#5145E5] text-xs">
                        <Send className="w-3.5 h-3.5" /> Submit Review
                      </Button>
                    </div>
                  </form>
                )}

                {eventFeedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {eventFeedbacks.map(f => (
                      <div key={f.id} className="p-4 rounded-2xl bg-white border border-[#E7E9F0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#11152B]">{f.user_name || 'Verified Student'}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= f.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-[#687087] leading-relaxed">{f.feedback_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[#9299AA] text-center py-6">
                    No student reviews have been posted yet. Be the first to share your thoughts!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RELATED EVENTS SECTION */}
        {relatedEvents.length > 0 && (
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5145E5]">More Experiences</span>
                <h2 className="text-2xl font-bold text-[#11152B] mt-1">Related Campus Events</h2>
              </div>
              <Link to="/discover" className="text-xs font-bold text-[#5145E5] hover:underline">
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

      {/* Organizer Announcement Modal */}
      <Dialog
        isOpen={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        title="Broadcast Event Notice"
        description="Notify registered attendees about schedule adjustments, speaker arrivals, or venue changes."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#11152B] mb-1">Notice Headline</label>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Workshop Moved to Room 34-201"
              className="w-full text-xs p-3 bg-white border border-[#E7E9F0] rounded-xl text-[#11152B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#11152B] mb-1">Notice Details</label>
            <textarea
              rows={3}
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="State what has changed and any instructions for students..."
              className="w-full text-xs p-3 bg-white border border-[#E7E9F0] rounded-xl text-[#11152B]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E9F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setAnnouncementModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="bg-[#5145E5]">
              Publish Notice
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Report Modal Dialog */}
      <Dialog
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Outdated or Incorrect Listing"
        description="Help campus administration maintain accurate room allocations and event dates."
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          setReportSubmitted(true);
          setTimeout(() => {
            setReportModalOpen(false);
            setReportSubmitted(false);
            setReportNotes('');
            setToastMessage({ type: 'success', text: 'Integrity report submitted to Campus Administration for review.' });
          }, 600);
        }} className="space-y-4">
          <div>
            <label htmlFor="report-reason" className="block text-xs font-bold text-[#11152B] mb-1">Issue Type</label>
            <select
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#E7E9F0] rounded-xl text-[#11152B]"
            >
              <option value="incorrect_details">Incorrect Timings or Date</option>
              <option value="venue_changed">Room/Venue Moved or Cancelled</option>
              <option value="cancelled_unannounced">Event Not Happening</option>
              <option value="spam">Spam or Duplicate Listing</option>
            </select>
          </div>

          <div>
            <label htmlFor="report-notes" className="block text-xs font-bold text-[#11152B] mb-1">Additional Details</label>
            <textarea
              id="report-notes"
              rows={3}
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Explain what is inaccurate..."
              className="w-full text-xs p-3 bg-white border border-[#E7E9F0] rounded-xl text-[#11152B]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E9F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={reportSubmitted} className="bg-[#5145E5]">
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
export default EventDetailPage;
