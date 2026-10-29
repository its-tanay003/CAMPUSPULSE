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
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectPersonalScheduleConflicts } from '../lib/clashDetector';
import { generateICS } from '../lib/icsExport';

export const CalendarPage: React.FC = () => {
  const { events, savedEvents, registrations, currentUser } = useApp();
  const [viewType, setViewType] = useState<'agenda' | 'all'>('agenda');

  const userEventIds = new Set([
    ...savedEvents.filter(s => s.user_id === currentUser?.id).map(s => s.event_id),
    ...registrations.filter(r => r.user_id === currentUser?.id).map(r => r.event_id)
  ]);

  const userScheduleEvents = events.filter(e => userEventIds.has(e.id));
  const personalOverlaps = detectPersonalScheduleConflicts(userScheduleEvents);

  const displayedEvents = (viewType === 'agenda' ? userScheduleEvents : events.filter(e => e.status === 'published'))
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Switcher */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Campus Master Calendar
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              Synchronized timeline with personal agenda clash detection as defined in P17 Blueprint Section 07.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0B1020] p-1.5 rounded-xl border border-[#334155] text-xs font-semibold">
            <button
              onClick={() => setViewType('agenda')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                viewType === 'agenda'
                  ? 'bg-[#7C5CFC] text-white shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-[#38BDF8]" />
              My Agenda ({userScheduleEvents.length})
            </button>
            <button
              onClick={() => setViewType('all')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                viewType === 'all'
                  ? 'bg-[#7C5CFC] text-white shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <List className="w-3.5 h-3.5 text-[#38BDF8]" />
              All Campus Events
            </button>
          </div>
        </div>

        {/* Personal Overlap Alert */}
        {personalOverlaps.length > 0 && viewType === 'agenda' && (
          <aside aria-label="Personal schedule conflict alert" className="mb-8 bg-amber-950/50 border-l-4 border-amber-500 rounded-r-2xl p-5 text-amber-100 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-amber-300">
                  Personal Schedule Conflict Detected ({personalOverlaps.length})
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  You have saved or registered for multiple events occurring at the exact same time window. CampusPulse informs you of collisions so you can choose which event to prioritize.
                </p>

                <div className="mt-3 space-y-2">
                  {personalOverlaps.map((overlap, idx) => (
                    <div key={idx} className="bg-[#151C2F] p-3 rounded-xl border border-amber-500/30 text-xs text-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-medium">
                        <span className="font-bold text-[#38BDF8]">{overlap.eventA.title}</span>
                        <span className="text-[#94A3B8] mx-2">overlaps with</span>
                        <span className="font-bold text-amber-400">{overlap.eventB.title}</span>
                      </div>
                      <span className="font-mono text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0">
                        Collision: {overlap.overlapTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Agenda Timeline List */}
        <div className="space-y-4">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(event => {
              const startDate = new Date(event.start_time);
              const endDate = new Date(event.end_time);

              const timeStr = `${startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

              const isRegistered = registrations.some(r => r.user_id === currentUser?.id && r.event_id === event.id);
              const isSaved = savedEvents.some(s => s.user_id === currentUser?.id && s.event_id === event.id);

              return (
                <div
                  key={event.id}
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-[#7C5CFC]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
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

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                        <span className="font-semibold text-[#38BDF8]">{event.category}</span>
                        <span>•</span>
                        <span>{event.organization?.name}</span>
                        {isRegistered && (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Registered
                          </span>
                        )}
                        {!isRegistered && isSaved && (
                          <span className="bg-[#7C5CFC]/20 text-purple-300 border border-[#7C5CFC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Saved
                          </span>
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

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <button
                      onClick={() => generateICS(event)}
                      className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition"
                      title="Download .ics"
                    >
                      Export .ics
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 shadow"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow-lg">
              <CalendarIcon className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
              <h3 className="text-base font-bold text-[#F8FAFC]">Your agenda is empty</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
                You haven't saved or registered for any events yet. Explore upcoming campus activities and save them to plan your schedule.
              </p>
              <Link
                to="/discover"
                className="mt-4 inline-block bg-[#7C5CFC] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
              >
                Browse Events Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
