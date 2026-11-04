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
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateICS } from '../lib/icsExport';
import { Button, Badge, Card, EmptyState, Toast } from '../components/ui';

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
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">Student Workspace</Badge>
                <span className="text-xs font-mono text-slate-400">· {currentUser.full_name}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1.5">
                My Campus Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Private personal agenda: distinguishing bookmarked interests from verified admission passes.
              </p>
            </div>

            <div className="flex bg-[#050814]/80 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                Saved Bookmarks ({userSaved.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'registered'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confirmed Passes ({userRegistered.length})
              </button>
            </div>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <aside aria-label="Schedule state distinction notice" className="glass-card p-4 rounded-2xl text-xs text-slate-300 flex items-center gap-3">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white">Important Distinction:</strong> Saving an event bookmarks it to your personal timeline for planning; it does not guarantee a seat or reserve internal registration.
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

                    <h3 className="font-bold text-white text-base hover:text-cyan-300 transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="font-mono">{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">{event.cost}</span>
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
                      className="gap-1.5 rounded-xl"
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
                      className="gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl">
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
                      <Badge variant="success">{reg.status}</Badge>
                      <span className="text-white/20">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">Pass ID: {reg.id}</span>
                      <span className="text-white/20">·</span>
                      <span className="text-cyan-400 font-semibold">{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-white text-base hover:text-cyan-300 transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 pt-1">
                      <span className="font-mono">{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>

                    {reg.notes && (
                      <div className="mt-2.5 text-xs text-slate-300 bg-[#050814]/80 p-3 rounded-2xl border border-white/10">
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
                      className="gap-1.5 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Export
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl">
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
