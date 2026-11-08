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
  Search,
  Trophy,
  Users,
  CheckCircle2
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

  const publishedEvents = events.filter(e => e.status === 'published');
  const featuredEvent = publishedEvents[0];
  const filteredEvents = selectedCategory === 'All'
    ? publishedEvents.slice(0, 6)
    : publishedEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="min-h-screen text-[#11152B] relative">
      {/* 1. Prototype Disclosures Banner */}
      <aside aria-label="Prototype demo indicator" className="bg-white border-b border-[#E7E9F0] py-2 px-4 text-xs text-[#687087] shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A36A] shadow-[0_0_8px_rgba(22,163,106,0.6)] animate-pulse" />
            <span className="font-bold text-[#11152B]">Demonstration Environment:</span>
            <span>All campus events, venues, and student chapters shown are consented demonstration models for INT335.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#5145E5] font-bold">Campus: LPU Phagwara</span>
            <span className="text-[#D1D5E4]">|</span>
            <span className="text-[#9299AA]">v2.0-redesign</span>
          </div>
        </div>
      </aside>

      {/* 2. Asymmetric Bento Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#E7E9F0] bg-gradient-to-b from-white via-[#F7F8FC] to-[#F0EDFF]/30">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[600px] h-[350px] bg-[#5145E5]/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[300px] bg-[#C8F169]/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Hero Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0EDFF] border border-[#5145E5]/30 text-[#5145E5] text-xs font-mono font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#5145E5]" />
                <span>Your Campus · Your Community · Your Moments</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#11152B] leading-[1.1]">
                Every event on campus, <span className="text-[#5145E5] underline decoration-[#C8F169] decoration-wavy decoration-2">zero scheduling chaos.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#687087] leading-relaxed max-w-2xl font-normal">
                Discover hackathons, cultural fests, and hands-on workshops without digging through cluttered messaging groups. Built-in clash radar protects club organizers from double-booking university venues.
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
                  <Search className="absolute left-4 w-5 h-5 text-[#9299AA] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by event title, tech stack, society, or hall..."
                    className="w-full pl-12 pr-32 py-4 bg-white border border-[#E7E9F0] rounded-2xl text-sm text-[#11152B] placeholder-[#9299AA] focus:outline-none focus:ring-2 focus:ring-[#5145E5] transition shadow-xs"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5145E5] hover:bg-[#4338CA] transition shadow-xs cursor-pointer active-press"
                  >
                    Explore
                  </button>
                </form>
              </div>

              {/* Primary CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link to="/discover">
                  <Button variant="primary" size="lg" className="gap-2.5 text-sm shadow-md bg-[#5145E5] hover:bg-[#4338CA]">
                    <Compass className="w-5 h-5 text-[#C8F169]" />
                    Explore All Events
                  </Button>
                </Link>

                <Link to="/home">
                  <Button variant="secondary" size="lg" className="gap-2 text-sm border-[#E7E9F0] hover:border-[#D1D5E4]">
                    <Users className="w-4 h-4 text-[#5145E5]" />
                    Student Dashboard
                  </Button>
                </Link>

                <Link to="/organizer/create" className="text-xs sm:text-sm font-bold text-[#687087] hover:text-[#5145E5] px-3 py-2 flex items-center gap-1.5 transition">
                  <Building className="w-4 h-4 text-[#5145E5]" />
                  Publish Event
                </Link>
              </div>

              {/* Value Highlights */}
              <div className="pt-6 border-t border-[#E7E9F0] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#687087] font-semibold">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A36A] shrink-0" />
                  <span>Verified Club Chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5145E5] shrink-0" />
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
              <div className="cp-card p-6 sm:p-7 relative space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E9F0]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-[#16A36A]" />
                  </div>
                  <span className="text-[10px] font-mono text-[#5145E5] uppercase tracking-wider font-bold">Live Spotlight</span>
                </div>

                {featuredEvent && (
                  <div className="space-y-4">
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-[#F0EDFF] border border-[#E7E9F0]">
                      <img 
                        src={featuredEvent.cover_image} 
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-mono font-bold text-[#11152B] border border-[#E7E9F0] shadow-xs">
                          {featuredEvent.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-mono text-[#5145E5] font-bold mb-1">{featuredEvent.organization?.name}</div>
                      <h3 className="text-lg font-bold text-[#11152B] leading-snug">{featuredEvent.title}</h3>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#687087] bg-[#F7F8FC] p-3 rounded-xl border border-[#E7E9F0] font-mono">
                        <span>{new Date(featuredEvent.start_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        <span>{featuredEvent.venue?.name}</span>
                        <span className="text-[#16A36A] font-bold">{featuredEvent.cost}</span>
                      </div>
                    </div>

                    <Link to={`/events/${featuredEvent.id}`} className="block">
                      <Button variant="primary" size="sm" className="w-full justify-center bg-[#5145E5] hover:bg-[#4338CA]">
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
      <section className="bg-white py-16 border-b border-[#E7E9F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5145E5] font-bold">Curated Tracks</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#11152B] tracking-tight mt-0.5">Explore by Category</h2>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-[#5145E5] text-white shadow-xs'
                    : 'bg-[#F7F8FC] text-[#687087] hover:text-[#11152B] hover:bg-[#F0EDFF] border border-[#E7E9F0]'
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
                      ? 'bg-[#5145E5] text-white shadow-xs'
                      : 'bg-[#F7F8FC] text-[#687087] hover:text-[#11152B] hover:bg-[#F0EDFF] border border-[#E7E9F0]'
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
              <Button variant="secondary" size="md" className="gap-2 border-[#E7E9F0]">
                Browse Full Event Catalogue ({events.length} listings)
                <ArrowRight className="w-4 h-4 text-[#5145E5]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How CampusPulse Works (Simple 3-Step Flow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#5145E5] font-bold">Campus Architecture</span>
          <h2 className="text-3xl font-extrabold text-[#11152B] tracking-tight">How CampusPulse Works</h2>
          <p className="text-sm text-[#687087]">
            A friction-free ecosystem connecting students, societies, and administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="cp-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EDFF] border border-[#5145E5]/20 flex items-center justify-center font-mono font-bold text-lg text-[#5145E5]">
              01
            </div>
            <h3 className="text-lg font-bold text-[#11152B]">Discover & Personalize</h3>
            <p className="text-xs text-[#687087] leading-relaxed">
              Explore events filtered by tags, dates, and venues. Save events to your personal schedule with automatic overlap warnings.
            </p>
          </div>

          <div className="cp-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#16A36A]/10 border border-[#16A36A]/30 flex items-center justify-center font-mono font-bold text-lg text-[#16A36A]">
              02
            </div>
            <h3 className="text-lg font-bold text-[#11152B]">Propose Without Clashing</h3>
            <p className="text-xs text-[#687087] leading-relaxed">
              Club organizers enter proposed dates and venues. The clash radar immediately checks physical double-booking before submission.
            </p>
          </div>

          <div className="cp-card p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5145E5]/10 border border-[#5145E5]/30 flex items-center justify-center font-mono font-bold text-lg text-[#5145E5]">
              03
            </div>
            <h3 className="text-lg font-bold text-[#11152B]">Verified Dean Clearance</h3>
            <p className="text-xs text-[#687087] leading-relaxed">
              Administrators review pending submissions with transparent clash evidence and audit trails. Approved events publish instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Organizer Call-to-Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-r from-[#11152B] via-[#1E2345] to-[#11152B] text-white rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C8F169]/20 text-[#C8F169] border border-[#C8F169]/40 px-3 py-1 rounded-full">
              For Campus Societies & Clubs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white tracking-tight">
              Publish events without colliding with other campus organizations.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              CampusPulse runs deterministic interval checks (<code className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded text-[#C8F169] border border-white/10">A.start &lt; B.end AND B.start &lt; A.end</code>) against authoritative room reservations to eliminate double-booking before proposals reach the Dean's desk.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/organizer/clashes">
                <Button variant="primary" size="md" className="gap-2 bg-[#5145E5] hover:bg-[#4338CA] text-white">
                  Launch Clash Simulator →
                </Button>
              </Link>
              <Link to="/organizer/create">
                <Button variant="secondary" size="md" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
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
