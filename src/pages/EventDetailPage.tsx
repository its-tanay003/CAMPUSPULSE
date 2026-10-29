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
    isEventRegistered,
    currentUser 
  } = useApp();

  const [registering, setRegistering] = useState(false);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);
  const [regErrorMessage, setRegErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-slate-500 mt-2">The event listing you requested does not exist or may have been unlisted.</p>
        <Link to="/discover" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Event Catalogue
          </Link>
        </div>

        {/* Cancellation Notice if event cancelled */}
        {event.status === 'cancelled' && (
          <aside aria-label="Cancellation notice" className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-rose-900">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              This event has been officially cancelled by the organizers.
            </div>
            <p className="text-xs text-rose-700 mt-1">
              Registered participants will not need to attend. Room booking has been released.
            </p>
          </aside>
        )}

        {/* Hero Poster & Core Details Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="relative h-64 sm:h-96 w-full bg-slate-900">
            <img
              src={event.cover_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-[#FF6500] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {event.category}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/20">
                  {event.cost} Entry
                </span>
                {event.status === 'published' && (
                  <span className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved Listing
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                {event.title}
              </h1>

              <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-300">
                <span>Organized by</span>
                <span className="font-semibold text-white underline">{event.organization?.name}</span>
                {event.organization?.is_verified && (
                  <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded">
                    Verified Club
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-b border-slate-200 bg-slate-50/80 p-4 gap-4 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{dateFormatted}</div>
                <div className="text-xs text-slate-500">Date of Event</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{timeFormatted}</div>
                <div className="text-xs text-slate-500">Time Window ({event.timezone})</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">{event.venue?.name}</div>
                <div className="text-xs text-slate-500">{event.venue?.building} · {event.venue?.location}</div>
              </div>
            </div>
          </div>

          {/* Registration & Actions Bar */}
          <div className="p-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Primary Register CTA */}
              {event.status === 'cancelled' ? (
                <button disabled className="bg-slate-200 text-slate-500 font-bold px-6 py-3 rounded-xl text-xs cursor-not-allowed">
                  Registrations Closed
                </button>
              ) : event.registration_method === 'external' ? (
                <a
                  href={event.registration_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow"
                >
                  <ExternalLink className="w-4 h-4" />
                  Register on External Portal
                </a>
              ) : event.registration_method === 'none' ? (
                <div className="bg-slate-100 text-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-200">
                  Open Walk-In (No prior registration required)
                </div>
              ) : registered ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Seat Confirmed
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-[#0B192C] hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 shadow transition"
                >
                  {registering ? 'Confirming...' : 'Register for Event (1-Click)'}
                </button>
              )}

              {/* Save / Bookmark Button */}
              <button
                onClick={() => toggleSaveEvent(event.id)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                  saved
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Saved in Agenda' : 'Save Event'}</span>
              </button>

              {/* Export .ICS Calendar invite */}
              <button
                onClick={() => generateICS(event)}
                className="p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition"
                title="Download .ics file for Google Calendar, Outlook or Apple Calendar"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Add to Calendar (.ics)</span>
              </button>
            </div>

            {/* Share action */}
            <div>
              <button
                onClick={handleShare}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? 'Link Copied!' : 'Share Event'}</span>
              </button>
            </div>
          </div>

          {/* Feedback messages for registration */}
          {regSuccessMessage && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {regSuccessMessage}
            </div>
          )}
          {regErrorMessage && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {regErrorMessage}
            </div>
          )}

          {/* Full Event Details & Organizer Verification Info */}
          <div className="p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About This Event</h2>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Target Audience & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Audience</h3>
                <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-md inline-block">
                  {event.target_audience}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keywords & Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {event.tags.map(t => (
                    <span key={t} className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizing Club Card */}
            <div className="pt-6 border-t border-slate-200 bg-slate-50 p-6 rounded-xl">
              <div className="flex items-start gap-4">
                <img
                  src={event.organization?.logo_url || 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80'}
                  alt={event.organization?.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{event.organization?.name}</h3>
                    {event.organization?.is_verified && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Official Campus Organization
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {event.organization?.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {event.organization?.contact_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" /> Lead: {event.organization?.lead_name}
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
