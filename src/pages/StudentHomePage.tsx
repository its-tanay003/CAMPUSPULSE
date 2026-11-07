import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Bookmark, 
  Clock, 
  MapPin, 
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, Badge } from '../components/ui';
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
    <div className="min-h-screen text-slate-100 py-10 relative">
      {/* Background ambient radial aura */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* 1. Welcome Hero Section & Quick Metrics */}
        <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 glow-indigo">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>Student Intelligence Hub</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">{currentUser?.campus || 'Main Campus'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome back, <span className="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">{currentUser?.full_name?.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-slate-300">
                Explore campus happenings, coordinate your weekly schedule, and stay ahead with intelligent clash alerts.
              </p>
            </div>

            {/* Quick Metrics Bar calculated strictly from real state */}
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to="/my-events" 
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-500/40 transition-all duration-300 flex items-center gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-white text-base tracking-tight font-mono">{userScheduleEvents.length} Saved</div>
                  <div className="text-[11px] text-slate-400">In your agenda</div>
                </div>
              </Link>

              <Link 
                to="/calendar" 
                className="group p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-500/40 transition-all duration-300 flex items-center gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-white text-base tracking-tight font-mono">Master Feed</div>
                  <div className="text-[11px] text-slate-400">Calendar timeline</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Global Search Input */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/discover?q=${encodeURIComponent(searchQuery)}`; }} className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus events, workshops, clubs, venues, or topics..."
                className="w-full pl-12 pr-32 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500/50 backdrop-blur-md transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 transition shadow-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* 2. Personal Schedule Conflict Alert Banner */}
        {personalOverlaps.length > 0 && (
          <aside aria-label="Personal scheduling conflict banner" className="glass-panel border-l-4 border-l-amber-500 border border-amber-500/20 rounded-2xl p-6 text-amber-100 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-base text-amber-800 flex items-center gap-2">
                    <span>Personal Schedule Conflict Detected</span>
                    <Badge variant="warning">{personalOverlaps.length} collisions</Badge>
                  </h3>
                  <Link to="/calendar" className="text-xs text-indigo-600 hover:text-indigo-600 hover:underline font-mono inline-flex items-center gap-1">
                    Compare in Calendar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="text-xs text-slate-300">
                  You have saved or registered for multiple events occurring within the exact same time window. Consider adjusting your saved items.
                </p>
                <div className="mt-3 space-y-2">
                  {personalOverlaps.map((overlap, idx) => (
                    <div key={idx} className="bg-black/30 p-3 rounded-xl border border-amber-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-medium text-slate-200">
                        <span className="text-indigo-600 font-bold">{overlap.eventA.title}</span> collisions with <span className="text-amber-800 font-bold">{overlap.eventB.title}</span>
                      </span>
                      <span className="font-mono text-[11px] bg-amber-500/10 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-500/30">
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
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400">Curated For You</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Recommended Events
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </h2>
              </div>
              <Link to="/profile" className="text-xs text-indigo-600 hover:text-indigo-600 hover:underline font-mono">
                Interests: {userInterests.join(', ')} →
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
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600">Campus Agenda</span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">Upcoming Chronological Schedule</h2>
            </div>
            <Link to="/discover" className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 hover:underline">
              Browse all events <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-card rounded-3xl border border-slate-200 divide-y divide-white/5 overflow-hidden shadow-xl">
            {upcomingAgenda.map(event => {
              const startDate = new Date(event.start_time);
              const endDate = new Date(event.end_time);

              return (
                <div key={event.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center shrink-0 shadow-inner">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        {startDate.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-lg font-extrabold font-mono text-white leading-none">
                        {startDate.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400 text-xs">{event.organization?.name}</span>
                      </div>
                      <h3 className="font-bold text-white text-base hover:text-indigo-300 transition">
                        <Link to={`/events/${event.id}`}>{event.title}</Link>
                      </h3>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} – {endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          {event.venue?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Link to={`/events/${event.id}`}>
                      <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
