import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Building, 
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, EmptyState } from '../components/ui';
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
  const { events, currentUser, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter only published approved events
  const publishedEvents = events.filter(e => e.status === 'published');
  
  // Featured event (first published event)
  const featuredEvent = publishedEvents[0];

  // Filtered list by category selection
  const filteredEvents = selectedCategory === 'All'
    ? publishedEvents.slice(0, 6)
    : publishedEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="min-h-screen text-slate-900 relative">
      {/* 1. Prototype Disclosures Banner */}
      <aside aria-label="Prototype demo indicator" className="bg-white border-b border-slate-200 py-2 px-4 text-xs text-slate-600 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="font-semibold text-slate-800">Demonstration Environment:</span>
            <span>All campus events and venues shown are consented demonstration models for INT335.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-indigo-600 font-semibold">Campus: LPU Phagwara</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">v1.0-light</span>
          </div>
        </div>
      </aside>

      {/* 2. Asymmetric Bento Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-sky-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-mono font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Your Campus · Your Community · Your Moments</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                Every event on campus, <span className="bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">zero scheduling chaos.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Discover hackathons, cultural nights, and workshops without wading through fragmented WhatsApp groups. Built-in clash radar protects organizers from double-booking venues.
              </p>

              {/* Instant Search Bar */}
              <div className="pt-2 max-w-xl">
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    window.location.href = `/discover?q=${encodeURIComponent(searchQuery)}`; 
                  }} 
                  className="relative flex items-center shadow-sm"
                >
                  <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event title, tech stack, society, or hall..."
                    className="w-full pl-12 pr-32 py-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                  >
                    Explore
                  </button>
                </form>
              </div>

              {/* Primary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/discover">
                  <Button variant="primary" size="lg" className="gap-2.5 text-sm shadow-sm">
                    <Compass className="w-5 h-5 text-white" />
                    Explore All Events
                  </Button>
                </Link>

                <Link to={currentUser?.role === 'organizer' ? '/organizer/create' : '/organizer'}>
                  <Button variant="secondary" size="lg" className="gap-2 text-sm border-slate-200 hover:border-slate-300">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Organise an Event
                  </Button>
                </Link>

                <Link to="/calendar" className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 flex items-center gap-1.5 transition">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Master Schedule
                </Link>
              </div>

              {/* Value Highlights */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Club Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Deterministic Clash Radar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant Pass Registration</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Bento Preview Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xl relative space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Live Campus Pulse</span>
                </div>

                {featuredEvent && (
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img 
                        src={featuredEvent.cover_image} 
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-mono font-bold text-slate-800 border border-slate-200 shadow-sm">
                          {featuredEvent.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-mono text-indigo-600 font-semibold mb-1">{featuredEvent.organization?.name}</div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{featuredEvent.title}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono">
                        <span>{new Date(featuredEvent.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        <span>{featuredEvent.venue?.name}</span>
                        <span className="text-indigo-600 font-bold">{featuredEvent.cost}</span>
                      </div>
                    </div>

                    <Link to={`/events/${featuredEvent.id}`} className="block">
                      <Button variant="primary" size="sm" className="w-full justify-center">
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
      <section className="bg-slate-50/50 py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Curated Categories</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">Explore by Interest</h2>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
                      ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How CampusPulse Works (Simple 3-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold">Simple Architecture</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CampusPulse Works</h2>
          <p className="text-sm text-slate-500">
            A frictionless platform designed for students, clubs, and campus governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-mono font-bold text-lg text-indigo-600">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900">Discover & Personalize</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore events filtered by tags, dates, and venues. Save events to your personal schedule with automatic overlap warnings.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-mono font-bold text-lg text-emerald-600">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900">Propose Without Clashing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Club organizers enter proposed dates and venues. The clash radar immediately checks physical double-booking before submission.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center font-mono font-bold text-lg text-purple-600">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Dean Clearance</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Administrators review pending submissions with transparent clash evidence and audit trails. Approved events publish instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Organizer Call-to-Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-r from-indigo-50 via-white to-slate-50 rounded-3xl border border-indigo-100 p-8 sm:p-14 shadow-md relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
              For Campus Societies & Clubs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-slate-900 tracking-tight">
              Publish events without colliding with other campus organizations.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              CampusPulse runs deterministic interval checks (<code className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-700 border border-slate-200">A.start &lt; B.end AND B.start &lt; A.end</code>) against authoritative room reservations to eliminate double-booking before proposals reach the Dean's desk.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/organizer/clashes">
                <Button variant="primary" size="md" className="gap-2">
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
export default LandingPage;
