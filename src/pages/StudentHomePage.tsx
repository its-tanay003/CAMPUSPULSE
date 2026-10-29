import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Bookmark, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Sparkles,
  AlertTriangle,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, Card, Badge } from '../components/ui';
import { detectPersonalScheduleConflicts } from '../lib/clashDetector';

export const StudentHomePage: React.FC = () => {
  const { 
    currentUser, 
    events, 
    savedEvents, 
    registrations, 
    searchQuery, 
    setSearchQuery 
  } = useApp();

  // Filter published events
  const publishedEvents = events.filter(e => e.status === 'published');

  // User's schedule ids
  const userEventIds = new Set([
    ...savedEvents.filter(s => s.user_id === currentUser?.id).map(s => s.event_id),
    ...registrations.filter(r => r.user_id === currentUser?.id).map(r => r.event_id)
  ]);

  const userScheduleEvents = events.filter(e => userEventIds.has(e.id));
  const personalOverlaps = detectPersonalScheduleConflicts(userScheduleEvents);

  // Transparent Recommendations based on user interests
  const userInterests = currentUser?.interests || [];
  const recommendedEvents = publishedEvents
    .filter(e => userInterests.includes(e.category))
    .slice(0, 3);

  // Upcoming chronological agenda
  const upcomingAgenda = publishedEvents
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Welcome Section & Global Search (Table 13, Blueprint) */}
        <div className="bg-[#151C2F] rounded-3xl border border-[#334155] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="primary">Campus Student Hub</Badge>
                <span className="text-xs text-[#94A3B8]">· {currentUser?.campus}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">
                Welcome back, {currentUser?.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8]">
                Here is your campus pulse for this week. Explore activities matching your interests.
              </p>
            </div>

            {/* Quick Metrics Bar calculated strictly from real state */}
            <div className="flex items-center gap-3">
              <Link to="/my-events" className="bg-[#0B1020] p-3 rounded-2xl border border-[#334155] flex items-center gap-3 hover:border-[#7C5CFC]/50 transition">
                <Bookmark className="w-5 h-5 text-[#38BDF8]" />
                <div className="text-left text-xs">
                  <div className="font-bold text-[#F8FAFC]">{userScheduleEvents.length} Saved</div>
                  <div className="text-[10px] text-[#94A3B8]">In your agenda</div>
                </div>
              </Link>

              <Link to="/calendar" className="bg-[#0B1020] p-3 rounded-2xl border border-[#334155] flex items-center gap-3 hover:border-[#7C5CFC]/50 transition">
                <Calendar className="w-5 h-5 text-[#7C5CFC]" />
                <div className="text-left text-xs">
                  <div className="font-bold text-[#F8FAFC]">Master Feed</div>
                  <div className="text-[10px] text-[#94A3B8]">Calendar view</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="mt-6 pt-6 border-t border-[#334155]">
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/discover?q=${encodeURIComponent(searchQuery)}`; }} className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus events, workshops, clubs, venues, or topics..."
                className="w-full pl-12 pr-28 py-3 bg-[#0B1020] border border-[#334155] rounded-xl text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
              />
              <Link
                to="/discover"
                className="absolute right-2 top-2 bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-4 py-1.5 rounded-lg transition"
              >
                Search
              </Link>
            </form>
          </div>
        </div>

        {/* 2. Personal Schedule Conflict Alert Banner */}
        {personalOverlaps.length > 0 && (
          <aside aria-label="Personal scheduling conflict banner" className="bg-amber-950/50 border-l-4 border-amber-500 rounded-r-2xl p-5 text-amber-100 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-amber-300">
                    Personal Schedule Conflict Detected ({personalOverlaps.length})
                  </h3>
                  <Link to="/calendar" className="text-xs text-[#38BDF8] hover:underline font-semibold">
                    Compare in Calendar →
                  </Link>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  You have saved or registered for multiple events occurring at the exact same time window.
                </p>
                <div className="mt-2 space-y-1.5">
                  {personalOverlaps.map((overlap, idx) => (
                    <div key={idx} className="bg-[#151C2F] p-2.5 rounded-xl border border-amber-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-medium text-[#F8FAFC]">
                        <span className="text-[#38BDF8] font-bold">{overlap.eventA.title}</span> collisions with <span className="text-amber-400 font-bold">{overlap.eventB.title}</span>
                      </span>
                      <span className="font-mono text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        {overlap.overlapTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 3. Recommended for You (Driven transparently by user interests) */}
        {recommendedEvents.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C5CFC]">Interest-Based Matching</span>
                <h2 className="text-xl font-bold text-[#F8FAFC] mt-0.5">Recommended for You</h2>
              </div>
              <Link to="/profile" className="text-xs text-[#38BDF8] hover:underline font-semibold">
                Edit Interests ({userInterests.join(', ')})
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Coming Up This Week: Agenda List (Table 13) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">Campus Agenda</span>
              <h2 className="text-xl font-bold text-[#F8FAFC] mt-0.5">Coming Up This Week</h2>
            </div>
            <Link to="/discover" className="text-xs text-[#7C5CFC] hover:underline font-bold flex items-center gap-1">
              All Events Catalogue <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#151C2F] rounded-2xl border border-[#334155] divide-y divide-[#334155] overflow-hidden shadow-md">
            {upcomingAgenda.map(event => {
              const startDate = new Date(event.start_time);
              const endDate = new Date(event.end_time);

              return (
                <div key={event.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E293B]/40 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0B1020] border border-[#334155] flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                        {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-lg font-extrabold text-[#F8FAFC] leading-none">
                        {startDate.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span className="text-[#334155]">·</span>
                        <span className="text-[#94A3B8]">{event.organization?.name}</span>
                      </div>
                      <h3 className="font-bold text-[#F8FAFC] text-base hover:text-[#38BDF8] transition">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <div className="text-xs text-[#94A3B8] flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#38BDF8]" />
                          {startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#7C5CFC]" />
                          {event.venue?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/events/${event.id}`} className="shrink-0">
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      View Event
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

