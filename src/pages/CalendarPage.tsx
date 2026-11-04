import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Bookmark, 
  CheckCircle2, 
  List, 
  Grid,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectPersonalScheduleConflicts } from '../lib/clashDetector';
import { generateICS } from '../lib/icsExport';
import { Button, Badge, Card, Toast } from '../components/ui';

export const CalendarPage: React.FC = () => {
  const { events, savedEvents, registrations, currentUser } = useApp();

  // Mode: Agenda (Accessible List default on mobile) vs Week View (on desktop)
  const [viewType, setViewType] = useState<'agenda' | 'week'>('agenda');
  const [filterMode, setFilterMode] = useState<'my_agenda' | 'campus_master'>('my_agenda');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Events saved or registered by this user
  const userEventIds = new Set([
    ...savedEvents.filter(s => s.user_id === currentUser?.id).map(s => s.event_id),
    ...registrations.filter(r => r.user_id === currentUser?.id).map(r => r.event_id)
  ]);

  const userScheduleEvents = events.filter(e => userEventIds.has(e.id));
  
  // Real personal overlap calculation
  const personalOverlaps = detectPersonalScheduleConflicts(userScheduleEvents);

  // Base list depending on filterMode
  const baseEvents = filterMode === 'my_agenda' ? userScheduleEvents : events.filter(e => e.status === 'published');

  // Sorted events
  const displayedEvents = [...baseEvents].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Toolbar */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">Campus Master Schedule</Badge>
                <span className="text-xs font-mono text-slate-400">· Asia/Kolkata (IST)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1.5">
                Event Calendar & Personal Timeline
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Inspect event timings and identify personal scheduling collisions before reserving tickets.
              </p>
            </div>

            {/* Scope Switcher: My Agenda vs Master Feed */}
            <div className="flex bg-[#050814]/80 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
              <button
                onClick={() => setFilterMode('my_agenda')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  filterMode === 'my_agenda'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                My Schedule ({userScheduleEvents.length})
              </button>
              <button
                onClick={() => setFilterMode('campus_master')}
                className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                  filterMode === 'campus_master'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5 text-cyan-400" />
                Master Feed ({events.filter(e => e.status === 'published').length})
              </button>
            </div>
          </div>

          {/* Subtoolbar: Layout Mode (Agenda default) + Prev/Next/Today Controls */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 font-medium">Display Mode:</span>
              <div className="flex bg-[#050814]/80 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewType('agenda')}
                  aria-pressed={viewType === 'agenda'}
                  className={`px-3.5 py-1.5 min-h-[36px] rounded-lg font-semibold transition cursor-pointer ${
                    viewType === 'agenda' ? 'bg-indigo-600/40 text-cyan-300 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Agenda List (Accessible)
                </button>
                <button
                  onClick={() => setViewType('week')}
                  aria-pressed={viewType === 'week'}
                  className={`hidden sm:inline-block px-3.5 py-1.5 min-h-[36px] rounded-lg font-semibold transition cursor-pointer ${
                    viewType === 'week' ? 'bg-indigo-600/40 text-cyan-300 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weekly View
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                className="gap-1 rounded-xl"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeekOffset(0)}
                className="font-bold text-cyan-400 hover:text-cyan-300"
              >
                Today
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="gap-1 rounded-xl"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* PERSONAL SCHEDULING CONFLICTS ALERT */}
        {personalOverlaps.length > 0 && filterMode === 'my_agenda' && (
          <aside aria-label="Personal scheduling collision" className="glass-card border-l-4 border-l-amber-500 rounded-3xl p-6 text-amber-100 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-bold text-base text-amber-300">
                    Personal Schedule Conflict Detected ({personalOverlaps.length})
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    You have saved multiple events occurring in the exact same time window. CampusPulse presents both event specifications below so you can choose which one matters more without the app automatically choosing for you.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {personalOverlaps.map((overlap, idx) => (
                    <div
                      key={idx}
                      className="bg-[#050814]/80 p-4 rounded-2xl border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="font-bold text-white text-sm">
                          <span className="text-cyan-400 underline decoration-cyan-500/40">{overlap.eventA.title}</span>
                          <span className="text-slate-400 font-normal mx-2.5">overlaps with</span>
                          <span className="text-amber-400 underline decoration-amber-500/40">{overlap.eventB.title}</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          A: {new Date(overlap.eventA.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({overlap.eventA.venue?.name}) | 
                          B: {new Date(overlap.eventB.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({overlap.eventB.venue?.name})
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="warning">Collision: {overlap.overlapTime}</Badge>
                        <Link to={`/events/${overlap.eventA.id}`}>
                          <Button variant="ghost" size="sm">Compare</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* AGENDA TIMELINE LIST */}
        <div className="space-y-4">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(event => {
              const startDate = new Date(event.start_time);
              const endDate = new Date(event.end_time);

              const timeStr = `${startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

              const isRegistered = registrations.some(r => r.user_id === currentUser?.id && r.event_id === event.id);
              const isSaved = savedEvents.some(s => s.user_id === currentUser?.id && s.event_id === event.id);

              return (
                <div
                  key={event.id}
                  className="glass-card rounded-3xl p-5 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-[#050814]/90 border border-white/10 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-xl font-mono font-extrabold text-white leading-none">
                        {startDate.getDate()}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">
                        {startDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Event Metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span>•</span>
                        <span>{event.organization?.name}</span>
                        {isRegistered && (
                          <Badge variant="success">Confirmed Pass</Badge>
                        )}
                        {!isRegistered && isSaved && (
                          <Badge variant="primary">Saved in Schedule</Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-white hover:text-cyan-300 text-base leading-snug transition">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium font-mono text-white">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" /> {timeStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {event.venue?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.08]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage('Exported .ics calendar invite.');
                      }}
                      className="gap-1.5 rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" /> Export .ics
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl">
                        View Event <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card rounded-3xl p-12 text-center glow-indigo">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <h3 className="text-base font-bold text-white">Your timeline is empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                You haven't saved or registered for any events yet. Explore upcoming activities to plan your schedule.
              </p>
              <div className="mt-5">
                <Link to="/discover">
                  <Button variant="gradient" size="sm">Browse Events</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <Toast
          type="success"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
