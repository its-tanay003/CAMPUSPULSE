import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  Bookmark, 
  List, 
  ChevronRight,
  ChevronLeft,
  Download,
  Sparkles,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectPersonalScheduleConflicts } from '../lib/clashDetector';
import { exportEventToCalendar, exportScheduleToCalendar } from '../lib/calendarExport';
import { Button, Badge, Toast } from '../components/ui';

export const CalendarPage: React.FC = () => {
  const { events, savedEvents, registrations, currentUser } = useApp();

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
    <div className="min-h-screen text-[#11152B] py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Toolbar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9F0] shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EDFF] text-[#5145E5] text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#5145E5]" />
                <span>Campus Master Schedule</span>
                <span className="text-[#D1D5E4]">·</span>
                <span className="text-[#687087]">Asia/Kolkata (IST)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#11152B] tracking-tight mt-2">
                Personal Calendar & Schedule
              </h1>
              <p className="text-xs sm:text-sm text-[#687087] mt-1 max-w-2xl leading-relaxed">
                Inspect campus event timings, identify schedule collisions, and sync verified passes directly to Apple Calendar or Google Calendar (.ics).
              </p>
            </div>

            {/* Scope Switcher & Export All */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex bg-[#F7F8FC] p-1.5 rounded-2xl border border-[#E7E9F0] text-xs font-semibold">
                <button
                  onClick={() => setFilterMode('my_agenda')}
                  className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    filterMode === 'my_agenda'
                      ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                      : 'text-[#687087] hover:text-[#11152B]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  My Agenda ({userScheduleEvents.length})
                </button>
                <button
                  onClick={() => setFilterMode('campus_master')}
                  className={`px-4 py-2 min-h-[38px] rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    filterMode === 'campus_master'
                      ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                      : 'text-[#687087] hover:text-[#11152B]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Master Feed ({events.filter(e => e.status === 'published').length})
                </button>
              </div>

              {userScheduleEvents.length > 0 && filterMode === 'my_agenda' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    exportScheduleToCalendar(userScheduleEvents, 'CampusPulse_My_Agenda');
                    setToastMessage('Exported full agenda (.ics) for external calendar import.');
                  }}
                  className="gap-1.5 border-[#E7E9F0] text-xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#5145E5]" /> Export All (.ics)
                </Button>
              )}
            </div>
          </div>

          {/* Subtoolbar: Layout Mode + Controls */}
          <div className="mt-6 pt-5 border-t border-[#E7E9F0] flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
            <div className="flex items-center gap-2.5">
              <span className="text-[#9299AA] font-mono text-[11px] font-bold">DISPLAY:</span>
              <div className="flex bg-[#F7F8FC] p-1 rounded-xl border border-[#E7E9F0]">
                <button
                  onClick={() => setViewType('agenda')}
                  aria-pressed={viewType === 'agenda'}
                  className={`px-3.5 py-1.5 min-h-[36px] rounded-lg font-bold transition cursor-pointer ${
                    viewType === 'agenda' ? 'bg-[#5145E5] text-white shadow-xs' : 'text-[#687087] hover:text-[#11152B]'
                  }`}
                >
                  Agenda List
                </button>
                <button
                  onClick={() => setViewType('week')}
                  aria-pressed={viewType === 'week'}
                  className={`hidden sm:inline-block px-3.5 py-1.5 min-h-[36px] rounded-lg font-bold transition cursor-pointer ${
                    viewType === 'week' ? 'bg-[#5145E5] text-white shadow-xs' : 'text-[#687087] hover:text-[#11152B]'
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
                className="gap-1 rounded-xl border-[#E7E9F0]"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeekOffset(0)}
                className="font-bold text-[#5145E5] hover:underline"
              >
                Today
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                className="gap-1 rounded-xl border-[#E7E9F0]"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* PERSONAL SCHEDULING CONFLICTS ALERT */}
        {personalOverlaps.length > 0 && filterMode === 'my_agenda' && (
          <aside aria-label="Personal scheduling collision" className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-amber-900 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-amber-950">
                    Schedule Overlap Warning: You have {personalOverlaps.length} conflicting event booking{personalOverlaps.length === 1 ? '' : 's'}.
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-amber-200/60 text-amber-900 px-2.5 py-0.5 rounded-full">
                    Action Recommended
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Attending overlapping sessions at the same time is not physically possible. Consider choosing your primary pass to keep attendance records accurate.
                </p>

                <div className="pt-2 space-y-2">
                  {personalOverlaps.map((overlap, idx) => (
                    <div key={idx} className="bg-white/90 p-3 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-[#11152B]">{overlap.eventA.title}</span>
                        <span className="text-amber-800 mx-2 font-bold">conflicts with</span>
                        <span className="font-bold text-[#11152B]">{overlap.eventB.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-amber-800 font-bold">
                          Collision: {overlap.overlapTime}
                        </span>
                        <Link to={`/events/${overlap.eventA.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs text-[#5145E5]">Compare</Button>
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
                  className="cp-card p-5 sm:p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="w-16 h-16 rounded-2xl bg-[#F0EDFF] border border-[#5145E5]/20 flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-[#5145E5] uppercase">
                        {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-xl font-mono font-black text-[#11152B] leading-none">
                        {startDate.getDate()}
                      </span>
                      <span className="text-[10px] font-mono text-[#687087] font-semibold">
                        {startDate.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>

                    {/* Event Metadata */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-[#687087]">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F7F8FC] border border-[#E7E9F0] text-[10px] font-bold text-[#11152B]">
                          {event.category}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-[#11152B]">{event.organization?.name}</span>
                        {isRegistered && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30">
                            Confirmed Pass
                          </span>
                        )}
                        {!isRegistered && isSaved && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/30">
                            Saved in Wallet
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-[#11152B] hover:text-[#5145E5] text-base leading-snug transition">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#687087]">
                        <span className="flex items-center gap-1.5 font-bold font-mono text-[#11152B]">
                          <Clock className="w-3.5 h-3.5 text-[#5145E5]" /> {timeStr}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#5145E5]" /> {event.venue?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E7E9F0]">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        exportEventToCalendar(event);
                        setToastMessage(`Exported calendar invite for ${event.title}`);
                      }}
                      className="gap-1.5 rounded-xl text-xs border-[#E7E9F0]"
                    >
                      <Download className="w-3.5 h-3.5 text-[#5145E5]" /> Export .ics
                    </Button>
                    <Link to={`/events/${event.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 rounded-xl text-xs bg-[#5145E5] hover:bg-[#4338CA]">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="cp-card p-12 text-center">
              <CalendarIcon className="w-12 h-12 mx-auto text-[#9299AA] mb-3" />
              <h3 className="text-base font-bold text-[#11152B]">Your calendar schedule is clear</h3>
              <p className="text-xs text-[#687087] max-w-sm mx-auto mt-1 leading-relaxed">
                You haven't saved or registered for any events yet. Explore upcoming activities to build your personal agenda.
              </p>
              <div className="mt-5">
                <Link to="/discover">
                  <Button variant="primary" size="sm" className="bg-[#5145E5] hover:bg-[#4338CA]">Browse Events</Button>
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
export default CalendarPage;
