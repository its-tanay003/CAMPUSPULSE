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
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-16 px-4">
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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header with Segregated Switcher */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">Student Workspace</Badge>
                <span className="text-xs text-[#94A3B8]">· {currentUser.full_name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-1">
                My Campus Schedule
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
                Private personal agenda: distinguishing bookmarked interests from verified admission passes.
              </p>
            </div>

            <div className="flex bg-[#0B1020] p-1.5 rounded-xl border border-[#334155] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#38BDF8]" />
                Saved Bookmarks ({userSaved.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'registered'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confirmed Passes ({userRegistered.length})
              </button>
            </div>
          </div>
        </div>

        {/* Informational Guidance Notice (P17 Section 07) */}
        <aside aria-label="Schedule state distinction notice" className="bg-[#151C2F]/50 border border-[#334155] p-3.5 rounded-xl text-xs text-[#94A3B8] flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
          <span>
            <strong className="text-[#F8FAFC]">Important Distinction:</strong> Saving an event bookmarks it to your personal timeline for planning; it does not guarantee a seat or reserve internal registration.
          </span>
        </aside>

        {/* TAB 1: SAVED BOOKMARKS */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {userSaved.length > 0 ? (
              userSaved.map(event => (
                <div
                  key={event.id}
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-[#7C5CFC]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Badge variant="secondary">{event.category}</Badge>
                      <span>•</span>
                      <span className="font-semibold text-[#F8FAFC]">{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base hover:text-[#38BDF8] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-3 pt-1">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold">{event.cost}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage({ type: 'success', text: 'Exported .ics calendar file.' });
                      }}
                      className="gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8]" /> .ics
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        toggleSaveEvent(event.id);
                        setToastMessage({ type: 'warning', text: `Removed "${event.title}" from saved bookmarks.` });
                      }}
                      className="gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1">
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
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="success">{reg.status}</Badge>
                      <span className="text-[#334155]">·</span>
                      <span className="text-[#94A3B8] font-mono text-[11px]">Pass ID: {reg.id}</span>
                      <span className="text-[#334155]">·</span>
                      <span className="text-[#38BDF8]">{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base hover:text-[#38BDF8] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-3 pt-1">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>

                    {reg.notes && (
                      <div className="mt-2 text-xs text-[#94A3B8] bg-[#0B1020] p-2.5 rounded-xl border border-[#334155]">
                        <strong className="text-[#F8FAFC]">Admission Pass Details:</strong> {reg.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage({ type: 'success', text: 'Downloaded .ics calendar invite.' });
                      }}
                      className="gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8]" /> Export
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1">
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
