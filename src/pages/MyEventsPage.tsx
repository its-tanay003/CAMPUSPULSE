import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Compass, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  ChevronRight, 
  Info,
  Sparkles,
  Ticket
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateICS } from '../lib/icsExport';
import { Button, Badge, EmptyState, Toast } from '../components/ui';

export const MyEventsPage: React.FC = () => {
  const { 
    events, 
    savedEvents, 
    registrations, 
    currentUser, 
    toggleSaveEvent 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'registered'>('saved');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  // 1. Authenticated User Check (Signed-out fallback state)
  if (!currentUser) {
    return (
      <div className="min-h-screen text-slate-100 py-16 px-4">
        <EmptyState
          icon={Bookmark}
          title="Sign In Required"
          description="Your saved event bookmarks and confirmed passes are private to your campus account. Please sign in to view your schedule."
          actionLabel="Sign In with Campus ID"
          onAction={() => window.location.href = '/login'}
        />
      </div>
    );
  }

  // Filter only current user's records (strict privacy)
  const userSaved = savedEvents
    .filter(s => s.user_id === currentUser.id)
    .map(s => events.find(e => e.id === s.event_id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const userRegistered = registrations
    .filter(r => r.user_id === currentUser.id)
    .map(r => ({
      reg: r,
      event: events.find(e => e.id === r.event_id)
    }))
    .filter((item): item is { reg: typeof item.reg; event: NonNullable<typeof item.event> } => Boolean(item.event));

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header with Segregated Switcher */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-[#C7F36B]" />
                <span>Student Hub</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{currentUser.full_name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
                My Campus Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Private personal agenda: bookmarked interests and verified admission passes.
              </p>
            </div>

            <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-[#4F46E5] text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#C7F36B]" />
                Saved Bookmarks ({userSaved.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'registered'
                    ? 'bg-[#4F46E5] text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                Confirmed Passes ({userRegistered.length})
              </button>
            </div>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <aside aria-label="Schedule state distinction notice" className="glass-panel p-4.5 rounded-2xl text-xs text-slate-300 flex items-center gap-3 border border-white/10">
          <Info className="w-4 h-4 text-[#C7F36B] shrink-0" />
          <span>
            <strong className="text-white">Planning Note:</strong> Saving an event bookmarks it to your personal timeline for planning; it does not reserve admission. Use 1-Click Registration on the event page to confirm your pass.
          </span>
        </aside>

        {/* TAB 1: SAVED BOOKMARKS */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {userSaved.length > 0 ? (
              userSaved.map(event => (
                <div
                  key={event.id}
                  className="glass-card rounded-3xl p-5 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Badge variant="secondary">{event.category}</Badge>
                      <span>•</span>
                      <span className="font-semibold text-white">{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-white text-base hover:text-[#C7F36B] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="font-mono text-slate-300">{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                      <span>·</span>
                      <span className="text-[#C7F36B] font-mono font-semibold">{event.cost}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.08]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage({ type: 'success', text: 'Exported .ics calendar file.' });
                      }}
                      className="gap-1.5 rounded-xl text-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> .ics
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleSaveEvent(event.id);
                        setToastMessage({ type: 'warning', text: `Removed "${event.title}" from saved bookmarks.` });
                      }}
                      className="gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl text-xs">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No saved events yet"
                description="Save interesting workshops, hackathons, or concerts while browsing to plan your schedule and receive conflict warnings."
                actionLabel="Explore Campus Discover"
                onAction={() => window.location.href = '/discover'}
              />
            )}
          </div>
        )}

        {/* TAB 2: CONFIRMED REGISTRATIONS */}
        {activeTab === 'registered' && (
          <div className="space-y-4">
            {userRegistered.length > 0 ? (
              userRegistered.map(({ reg, event }) => (
                <div
                  key={reg.id}
                  className="glass-card rounded-3xl p-5 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {reg.status}
                      </span>
                      <span className="text-white/20">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">Pass ID: {reg.id}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-[#C7F36B] font-semibold">{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-white text-base hover:text-[#C7F36B] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="font-mono text-slate-300">{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>

                    {reg.notes && (
                      <div className="mt-2.5 text-xs text-slate-300 bg-black/40 p-3 rounded-2xl border border-white/10">
                        <strong className="text-white">Admission Pass Details:</strong> {reg.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.08]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage({ type: 'success', text: 'Downloaded .ics calendar invite.' });
                      }}
                      className="gap-1.5 rounded-xl text-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Export
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl text-xs">
                        Pass & Venue <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No confirmed event passes"
                description="When you register for workshops or competitions with 1-click registration, your confirmed admission passes and venue entry notes will appear here."
                actionLabel="Find Events to Attend"
                onAction={() => window.location.href = '/discover'}
              />
            )}
          </div>
        )}
      </div>

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
