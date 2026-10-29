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
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateICS } from '../lib/icsExport';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    events, 
    toggleSaveEvent, 
    isEventSaved, 
    registerForEvent, 
    isEventRegistered
  } = useApp();

  const [registering, setRegistering] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [regErrorMessage, setRegErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-[#F8FAFC]">
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-[#94A3B8] mt-2">The event listing you requested does not exist or may have been unlisted.</p>
        <Link to="/discover" className="mt-4 inline-block bg-[#7C5CFC] text-white px-4 py-2 rounded-xl text-xs font-bold">
          Return to Event Directory
        </Link>
      </div>
    );
  }

  const saved = isEventSaved(event.id);
  const registered = isEventRegistered(event.id);

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const dateFormatted = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const timeFormatted = `${startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  const handleRegister = async () => {
    setRegistering(true);
    setRegErrorMessage(null);
    setRegSuccessMessage(null);

    const res = await registerForEvent(event.id);
    if (res.success) {
      setRegSuccessMessage(res.message);
    } else {
      setRegErrorMessage(res.message);
    }
    setRegistering(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#38BDF8] transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Event Catalogue
          </Link>
        </div>

        {/* Cancellation Notice if event cancelled */}
        {event.status === 'cancelled' && (
          <aside aria-label="Cancellation notice" className="mb-6 bg-rose-950/70 border-l-4 border-rose-500 p-4 rounded-r-xl text-rose-100 shadow-md">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              This event has been officially cancelled by the organizers.
            </div>
            <p className="text-xs text-rose-300 mt-1">
              Registered participants will not need to attend. Room booking has been released.
            </p>
          </aside>
        )}

        {/* Hero Poster & Core Details Banner */}
        <div className="bg-[#151C2F] rounded-3xl border border-[#334155] overflow-hidden shadow-2xl">
          <div className="relative h-64 sm:h-96 w-full bg-[#0B1020]">
            <img
              src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151C2F] via-[#151C2F]/50 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#7C5CFC] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  {event.category}
                </span>
                <span className="bg-[#151C2F]/80 backdrop-blur-md text-[#38BDF8] text-xs font-semibold px-3 py-1 rounded-full border border-[#334155]">
                  {event.cost} Entry
                </span>
                {event.status === 'published' && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved Listing
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] leading-tight">
                {event.title}
              </h1>

              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-[#94A3B8]">
                <span>Organized by</span>
                <span className="font-semibold text-[#F8FAFC] underline">{event.organization?.name}</span>
                {event.organization?.is_verified && (
                  <span className="text-[10px] bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 font-bold px-1.5 py-0.5 rounded">
                    Verified Club
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-[#334155] bg-[#0B1020]/60 p-4 gap-4 text-xs sm:text-sm text-[#94A3B8]">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#38BDF8] shrink-0" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">{dateFormatted}</div>
                <div className="text-[11px] text-[#94A3B8]">Date of Event</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#7C5CFC] shrink-0" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">{timeFormatted}</div>
                <div className="text-[11px] text-[#94A3B8]">Time Window ({event.timezone})</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-[#F8FAFC]">{event.venue?.name}</div>
                <div className="text-[11px] text-[#94A3B8]">{event.venue?.building} · {event.venue?.location}</div>
              </div>
            </div>
          </div>

          {/* Registration & Actions Bar */}
          <div className="p-6 bg-[#151C2F] border-b border-[#334155] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {event.status === 'cancelled' ? (
                <button disabled className="bg-slate-800 text-slate-500 font-bold px-6 py-3 rounded-xl text-xs cursor-not-allowed">
                  Registrations Closed
                </button>
              ) : event.registration_method === 'external' ? (
                <a
                  href={event.registration_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#38BDF8] hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  Register on External Portal
                </a>
              ) : event.registration_method === 'none' ? (
                <div className="bg-[#0B1020] text-[#94A3B8] font-semibold px-4 py-2.5 rounded-xl text-xs border border-[#334155]">
                  Open Walk-In (No prior registration required)
                </div>
              ) : registered ? (
                <div className="bg-emerald-950/40 border border-emerald-500 text-emerald-300 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Seat Confirmed
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow transition"
                >
                  {registering ? 'Confirming...' : 'Register for Event (1-Click)'}
                </button>
              )}

              {/* Save / Bookmark Button */}
              <button
                onClick={() => toggleSaveEvent(event.id)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                  saved
                    ? 'bg-[#7C5CFC] text-white border-[#7C5CFC]'
                    : 'bg-[#0B1020] hover:bg-[#1E293B] border-[#334155] text-[#94A3B8]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Saved in Agenda' : 'Save Event'}</span>
              </button>

              {/* Export .ICS Calendar invite */}
              <button
                onClick={() => generateICS(event)}
                className="p-3 rounded-xl border border-[#334155] bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold flex items-center gap-2 transition"
                title="Download .ics file"
              >
                <Download className="w-4 h-4 text-[#38BDF8]" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>

            {/* Share action */}
            <div>
              <button
                onClick={handleShare}
                className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-semibold flex items-center gap-1.5 p-2 rounded-lg hover:bg-[#1E293B] transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
              </button>
            </div>
          </div>

          {/* Feedback messages for registration */}
          {regSuccessMessage && (
            <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {regSuccessMessage}
            </div>
          )}
          {regErrorMessage && (
            <div className="p-4 bg-rose-950/40 border-b border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              {regErrorMessage}
            </div>
          )}

          {/* Full Event Details & Organizer Verification Info */}
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-3">About This Event</h2>
              <p className="text-[#94A3B8] leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Target Audience & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#334155]">
              <div>
                <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Target Audience</h3>
                <span className="text-sm font-semibold text-[#F8FAFC] bg-[#0B1020] px-3 py-1.5 rounded-lg inline-block border border-[#334155]">
                  {event.target_audience}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">Keywords & Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(t => (
                    <span key={t} className="text-xs bg-[#7C5CFC]/15 text-[#38BDF8] border border-[#7C5CFC]/30 font-medium px-2.5 py-1 rounded-lg">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizing Club Card */}
            <div className="pt-6 border-t border-[#334155] bg-[#0B1020]/40 p-6 rounded-2xl border">
              <div className="flex items-start gap-4">
                <img
                  src={event.organization?.logo_url || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80'}
                  alt={event.organization?.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#334155]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#F8FAFC] text-base">{event.organization?.name}</h3>
                    {event.organization?.is_verified && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                        Official Campus Organization
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    {event.organization?.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#38BDF8]" /> {event.organization?.contact_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#7C5CFC]" /> Lead: {event.organization?.lead_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
