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
  Info,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, Badge, Card, LoadingIndicator, EmptyState } from '../components/ui';
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
  const { events, isLoading, currentUser } = useApp();
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
      {/* 1. Prototype Disclosures Banner (Table 12, P17 Blueprint) */}
      <aside aria-label="Prototype demo indicator" className="bg-[#0D1326]/60 border-b border-white/[0.06] py-2 px-4 text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span className="font-semibold text-white">Demonstration Environment:</span>
            <span>All campus events and venues shown are consented demonstration models for INT335.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-cyan-400">Campus: LPU Phagwara</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">v1.0-p17</span>
          </div>
        </div>
      </aside>

      {/* 2. Hero Section with Modern Radial Glow */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-b border-white/[0.06]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-indigo-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-indigo-950/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>CampusPulse · Relevant Event Discovery & Scheduling Conflict Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Your Campus. Your Interests. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Your Next Experience.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Discover authentic campus experiences without wading through endless WhatsApp forwards and poster walls. For student leaders, publish with real-time room double-booking and audience collision guards.
            </p>

            {/* 3 & 4. Primary and Secondary CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/discover">
                <Button variant="gradient" size="lg" className="gap-2.5 text-sm shadow-xl shadow-indigo-600/30">
                  <Compass className="w-5 h-5 text-cyan-200" />
                  Explore Campus Events
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
                View Master Calendar
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/[0.06] text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-300">Verified Official Organisers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-medium text-slate-300">Zero Room Double-Booking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-medium text-slate-300">Zero Mandatory Account Barrier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Spotlight Event */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Spotlight Showcase</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">Featured Campus Experience</h2>
          </div>
          <Link to="/discover" className="text-xs sm:text-sm font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition">
            Browse All {publishedEvents.length} Events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingIndicator label="Loading spotlight event..." />
        ) : featuredEvent ? (
          <div className="glass-card rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 glow-indigo hover:border-indigo-500/40 transition-all duration-300">
            <div className="lg:col-span-7 h-72 lg:h-auto relative overflow-hidden bg-[#050814]">
              <img
                src={featuredEvent.cover_image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="primary" size="md">Editor's Choice</Badge>
                <Badge variant="neutral" size="md">Demo Record</Badge>
              </div>
            </div>

            <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 mb-3">
                  <span className="text-cyan-300 font-bold">{featuredEvent.organization?.name}</span>
                  <span className="text-slate-600">•</span>
                  <Badge variant="success">Approved by Admin</Badge>
                </div>

                <h3 className="text-2xl font-extrabold text-white hover:text-cyan-300 transition tracking-tight">
                  <Link to={`/events/${featuredEvent.id}`}>{featuredEvent.title}</Link>
                </h3>

                <p className="mt-3.5 text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 space-y-2.5 text-xs text-slate-300 bg-[#050814]/70 p-4.5 rounded-2xl border border-white/[0.07]">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-medium text-white">
                      {new Date(featuredEvent.start_time).toLocaleString('en-IN', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-slate-400">Venue:</span>
                    <span className="text-white font-medium">{featuredEvent.venue?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.07] flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Admission:</span>
                  <span className="ml-2 text-sm font-bold text-emerald-400 font-mono">{featuredEvent.cost}</span>
                </div>
                <Link to={`/events/${featuredEvent.id}`}>
                  <Button variant="primary" size="sm">
                    View Details & Register →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Featured Event"
            description="There are currently no featured campus events published."
          />
        )}
      </section>

      {/* 6. Browse by Interest/Category */}
      <section className="glass-panel py-16 border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Browse by Interest</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Select an interest to filter events with transparent category rules</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                    : 'bg-[#0D1326] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/10'
                }`}
              >
                All Topics
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === c.label
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                      : 'bg-[#0D1326] text-slate-400 hover:text-white hover:bg-white/[0.06] border border-white/10'
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
              description={`There are no published events in ${selectedCategory} right now. Try selecting another topic or check back soon.`}
              actionLabel="Show All Categories"
              onAction={() => setSelectedCategory('All')}
            />
          )}

          <div className="text-center mt-12">
            <Link to="/discover">
              <Button variant="secondary" size="md" className="gap-2">
                Browse Full Event Catalogue ({events.length} listings)
                <ArrowRight className="w-4 h-4 text-[#38BDF8]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Upcoming Campus Events Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">Chronological Agenda</span>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mt-1">Upcoming on Campus</h2>
          </div>
          <Link to="/calendar" className="text-xs font-bold text-[#7C5CFC] hover:text-purple-300 flex items-center gap-1">
            Master Calendar View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* 8. Organizer Call-to-Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-card bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0D1326] rounded-3xl border border-indigo-500/30 p-8 sm:p-14 shadow-2xl relative overflow-hidden glow-indigo">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <Badge variant="secondary" size="md">For Campus Club Organisers</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4 leading-tight text-white tracking-tight">
              Publish events without colliding with other campus societies.
            </h2>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              CampusPulse runs deterministic interval checks (<code className="text-xs font-mono bg-black/40 px-2 py-1 rounded text-cyan-300 border border-white/10">A.start &lt; B.end AND B.start &lt; A.end</code>) against authoritative room reservations and alerts you if another event targets the same student audience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/organizer/clashes">
                <Button variant="gradient" size="md" className="gap-2">
                  Launch Live Conflict Demo →
                </Button>
              </Link>
              <Link to="/organizer/create">
                <Button variant="secondary" size="md">
                  Create Event Draft
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer with relevant informational & privacy links */}
      <footer className="glass-panel text-slate-400 text-xs py-12 border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.08]">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-indigo-500/30">
                  P
                </div>
                <span className="font-extrabold text-base text-white tracking-tight">CampusPulse</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Campus-first event discovery and scheduling awareness platform built for the INT335 Design Thinking project.
              </p>
              <p className="text-[11px] text-slate-500">
                All event listings and venue reservations are demonstration data.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono mb-3">Platform</h4>
              <div><Link to="/discover" className="hover:text-cyan-300 transition">Event Catalogue</Link></div>
              <div><Link to="/calendar" className="hover:text-cyan-300 transition">Master Calendar</Link></div>
              <div><Link to="/clubs" className="hover:text-cyan-300 transition">Clubs & Societies</Link></div>
              <div><Link to="/organizer" className="hover:text-cyan-300 transition">Organizer Studio</Link></div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono mb-3">Governance</h4>
              <div><a href="#privacy" className="hover:text-cyan-300 transition">Privacy & Data Policy</a></div>
              <div><a href="#rls" className="hover:text-cyan-300 transition">Row Level Security (RLS)</a></div>
              <div><a href="#conflicts" className="hover:text-cyan-300 transition">Clash Policy Rules</a></div>
              <div><a href="#report" className="hover:text-cyan-300 transition">Report Outdated Listing</a></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
            <div>© 2026 CampusPulse Project (INT335 P17). All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Timezone: <strong className="text-slate-300">Asia/Kolkata (IST)</strong></span>
              <span>Campus: <strong className="text-slate-300">LPU Phagwara</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
