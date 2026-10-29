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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Toolbar (Table 15, Blueprint) */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">Campus Master Schedule</Badge>
                <span className="text-xs text-[#94A3B8]">· Asia/Kolkata (IST)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight mt-1">
                Event Calendar & Personal Timeline
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Inspect event timings and identify personal scheduling collisions before reserving tickets.
              </p>
            </div>

            {/* Scope Switcher: My Agenda vs Master Feed */}
            <div className="flex bg-[#0B1020] p-1.5 rounded-xl border border-[#334155] text-xs font-semibold">
              <button
                onClick={() => setFilterMode('my_agenda')}
                className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  filterMode === 'my_agenda'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#38BDF8]" />
                My Schedule ({userScheduleEvents.length})
              </button>
              <button
                onClick={() => setFilterMode('campus_master')}
                className={`px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  filterMode === 'campus_master'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <List className="w-3.5 h-3.5 text-[#38BDF8]" />
                Master Feed ({events.filter(e => e.status === 'published').length})
              </button>
            </div>
          </div>

          {/* Subtoolbar: Layout Mode (Agenda default) + Prev/Next/Today Controls */}
          <div className="mt-6 pt-4 border-t border-[#334155] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] font-medium">Display Mode:</span>
              <div className="flex bg-[#0B1020] p-1 rounded-lg border border-[#334155]">
                <button
                  onClick={() => setViewType('agenda')}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    viewType === 'agenda' ? 'bg-[#151C2F] text-[#38BDF8] shadow' : 'text-[#94A3B8]'
                  }`}
                >
                  Agenda List (Mobile Default)
                </button>
                <button
                  onClick={() => setViewType('week')}
                  className={`hidden sm:inline-block px-3 py-1 rounded font-semibold transition ${
                    viewType === 'week' ? 'bg-[#151C2F] text-[#38BDF8] shadow' : 'text-[#94A3B8]'
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
                className="gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeekOffset(0)}
                className="font-bold text-[#38BDF8]"
              >
                Today
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* PERSONAL SCHEDULING CONFLICTS ALERT (P17 Section 07) */}
        {personalOverlaps.length > 0 && filterMode === 'my_agenda' && (
          <aside aria-label="Personal scheduling collision" className="bg-amber-950/60 border-l-4 border-amber-500 rounded-r-2xl p-5 text-amber-100 shadow-xl">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-bold text-sm text-amber-300">
                    Personal Schedule Conflict Detected ({personalOverlaps.length})
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                    You have saved multiple events occurring in the exact same time window. CampusPulse presents both event specifications below so you can choose which one matters more without the app automatically choosing for you.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {personalOverlaps.map((overlap, idx) => (
                    <div
                      key={idx}
                      className="bg-[#151C2F] p-3.5 rounded-xl border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-[#F8FAFC]">
                          <span className="text-[#38BDF8] underline">{overlap.eventA.title}</span>
                          <span className="text-[#94A3B8] font-normal mx-2">overlaps with</span>
                          <span className="text-amber-400 underline">{overlap.eventB.title}</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
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

        {/* AGENDA TIMELINE LIST (Accessible alternative to canvas grid) */}
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
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-[#7C5CFC]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-[#0B1020] border border-[#334155] flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                        {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-xl font-extrabold text-[#F8FAFC] leading-none">
                        {startDate.getDate()}
                      </span>
                      <span className="text-[10px] text-[#38BDF8] font-bold">
                        {startDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Event Metadata */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
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

                      <h3 className="font-bold text-[#F8FAFC] hover:text-[#38BDF8] text-base leading-snug">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" /> {timeStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" /> {event.venue?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        generateICS(event);
                        setToastMessage('Exported .ics calendar invite.');
                      }}
                      className="gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8]" /> Export .ics
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1">
                        View Event <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow-lg">
              <CalendarIcon className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
              <h3 className="text-base font-bold text-[#F8FAFC]">Your timeline is empty</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
                You haven't saved or registered for any events yet. Explore upcoming activities to plan your schedule.
              </p>
              <div className="mt-4">
                <Link to="/discover">
                  <Button variant="primary" size="sm">Browse Events</Button>
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
