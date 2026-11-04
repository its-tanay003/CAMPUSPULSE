import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Building, 
  Layers, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, Badge, LoadingIndicator, EmptyState } from '../components/ui';
import type { EventCategory } from '../types';

const CATEGORIES: { label: EventCategory; desc: string; icon: string }[] = [
  { label: 'Technology', desc: 'AI, coding, hackathons & robotics', icon: '💻' },
  { label: 'Workshops', desc: 'Hands-on practical skill sessions', icon: '🛠️' },
  { label: 'Cultural', desc: 'Theatre, poetry, drama & arts', icon: '🎭' },
  { label: 'Music', desc: 'Unplugged concerts & acoustic jams', icon: '🎵' },
  { label: 'Sports', desc: 'Hostel leagues, badminton & tournaments', icon: '🏸' },
  { label: 'Research', desc: 'Symposiums & tech paper presentations', icon: '🔬' },
  { label: 'Photography', desc: 'Visual media & exhibitions', icon: '📷' },
  { label: 'Volunteering', desc: 'Campus community drives', icon: '🤝' },
  { label: 'Academic', desc: 'Lectures and orientations', icon: '📚' }
];

export const LandingPage: React.FC = () => {
  const { events, isLoading, currentUser, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter only published approved events
  const publishedEvents = events.filter(e => e.status === 'published');
  
  // Featured event (first published event)
  const featuredEvent = publishedEvents[0];
  
  // Upcoming events (next chronologically)
  const upcomingEvents = publishedEvents.slice(1, 4);

  // Filtered list by category selection
  const filteredEvents = selectedCategory === 'All'
    ? publishedEvents.slice(0, 6)
    : publishedEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="min-h-screen text-slate-100 relative">
      {/* 1. Prototype Disclosures Banner */}
      <aside aria-label="Prototype demo indicator" className="bg-[#101828]/80 border-b border-white/[0.06] py-2 px-4 text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C7F36B] shadow-[0_0_8px_#C7F36B] animate-pulse" />
            <span className="font-semibold text-white">Demonstration Environment:</span>
            <span>All campus events and venues shown are consented demonstration models for INT335.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#C7F36B]">Campus: LPU Phagwara</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">v1.0-p17</span>
          </div>
        </div>
      </aside>

      {/* 2. Asymmetric Bento Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-white/[0.06]">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-[#C7F36B]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium shadow-lg backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#C7F36B]" />
                <span>Your Campus · Your Community · Your Moments</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Every event on campus, <span className="bg-gradient-to-r from-white via-indigo-200 to-[#C7F36B] bg-clip-text text-transparent">zero scheduling chaos.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Discover hackathons, cultural nights, and workshops without wading through fragmented WhatsApp groups. Built-in clash radar protects organizers from double-booking venues.
              </p>

              {/* Instant Search Bar */}
              <div className="pt-2 max-w-xl">
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    window.location.href = `/discover?q=${encodeURIComponent(searchQuery)}`; 
                  }} 
                  className="relative flex items-center"
                >
                  <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event title, tech stack, society, or hall..."
                    className="w-full pl-12 pr-32 py-4 bg-white/[0.04] border border-white/15 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C7F36B] backdrop-blur-md transition shadow-2xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#C7F36B] hover:bg-[#b8e75a] transition shadow-md cursor-pointer"
                  >
                    Explore
                  </button>
                </form>
              </div>

              {/* Primary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/discover">
                  <Button variant="gradient" size="lg" className="gap-2.5 text-sm shadow-xl shadow-indigo-600/30">
                    <Compass className="w-5 h-5 text-[#C7F36B]" />
                    Explore All Events
                  </Button>
                </Link>

                <Link to={currentUser?.role === 'organizer' ? '/organizer/create' : '/organizer'}>
                  <Button variant="secondary" size="lg" className="gap-2 text-sm border-white/10 hover:border-white/20">
                    <Building className="w-4 h-4 text-cyan-400" />
                    Organise an Event
                  </Button>
                </Link>

                <Link to="/calendar" className="text-xs sm:text-sm font-semibold text-slate-400 hover:text-white px-3 py-2 flex items-center gap-1.5 transition">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Master Schedule
                </Link>
              </div>

              {/* Value Highlights */}
              <div className="pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C7F36B] shrink-0" />
                  <span>Verified Club Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Deterministic Clash Radar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Instant Pass Registration</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Bento Preview Widget */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 glow-indigo relative space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-[#C7F36B]/80" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Live Campus Pulse</span>
                </div>

                {featuredEvent && (
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-black/40 border border-white/10">
                      <img 
                        src={featuredEvent.cover_image} 
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#101828]/90 text-[10px] font-mono font-bold text-[#C7F36B] border border-white/10">
                          {featuredEvent.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-mono text-cyan-400 mb-1">{featuredEvent.organization?.name}</div>
                      <h3 className="text-lg font-bold text-white leading-snug">{featuredEvent.title}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-white/[0.03] p-3 rounded-xl border border-white/5 font-mono">
                        <span>{new Date(featuredEvent.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        <span>{featuredEvent.venue?.name}</span>
                        <span className="text-[#C7F36B]">{featuredEvent.cost}</span>
                      </div>
                    </div>

                    <Link to={`/events/${featuredEvent.id}`} className="block">
                      <Button variant="gradient" size="sm" className="w-full justify-center">
                        Register Free Pass →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Browse by Interest/Category */}
      <section className="glass-panel py-16 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C7F36B]">Curated Categories</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">Explore by Interest</h2>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                }`}
              >
                All Categories ({publishedEvents.length})
              </button>
              {CATEGORIES.slice(0, 6).map(c => (
                <button
                  key={c.label}
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === c.label
                      ? 'bg-[#4F46E5] text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/10'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={`No ${selectedCategory} Events`}
              description={`There are currently no published events in ${selectedCategory}. Try another category or check back soon.`}
              actionLabel="Show All Categories"
              onAction={() => setSelectedCategory('All')}
            />
          )}

          <div className="text-center mt-12">
            <Link to="/discover">
              <Button variant="secondary" size="md" className="gap-2">
                Browse Full Event Catalogue ({events.length} listings)
                <ArrowRight className="w-4 h-4 text-[#C7F36B]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How CampusPulse Works (Simple 3-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Simple Architecture</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">How CampusPulse Works</h2>
          <p className="text-sm text-slate-300">
            A frictionless platform designed for students, clubs, and campus governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-3xl p-7 border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-lg text-white">
              01
            </div>
            <h3 className="text-lg font-bold text-white">Discover & Personalize</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore events filtered by tags, dates, and venues. Save events to your personal schedule with automatic overlap warnings.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-7 border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C7F36B]/20 border border-[#C7F36B]/30 flex items-center justify-center font-mono font-bold text-lg text-[#C7F36B]">
              02
            </div>
            <h3 className="text-lg font-bold text-white">Propose Without Clashing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Club organizers enter proposed dates and venues. The clash radar immediately checks physical double-booking before submission.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-7 border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-lg text-purple-300">
              03
            </div>
            <h3 className="text-lg font-bold text-white">Verified Dean Clearance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Administrators review pending submissions with transparent clash evidence and audit trails. Approved events publish instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Organizer Call-to-Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="glass-card bg-gradient-to-r from-indigo-950/60 via-[#101828] to-[#131C31] rounded-3xl border border-indigo-500/30 p-8 sm:p-14 shadow-2xl relative overflow-hidden glow-indigo">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C7F36B]/20 text-[#C7F36B] border border-[#C7F36B]/40 px-3 py-1 rounded-full">
              For Campus Societies & Clubs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
              Publish events without colliding with other campus organizations.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              CampusPulse runs deterministic interval checks (<code className="text-xs font-mono bg-black/50 px-2 py-0.5 rounded text-[#C7F36B] border border-white/10">A.start &lt; B.end AND B.start &lt; A.end</code>) against authoritative room reservations to eliminate double-booking before proposals reach the Dean's desk.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/organizer/clashes">
                <Button variant="gradient" size="md" className="gap-2">
                  Launch Clash Simulator →
                </Button>
              </Link>
              <Link to="/organizer/create">
                <Button variant="secondary" size="md">
                  Submit Event Proposal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
