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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC]">
      {/* 1. Prototype Disclosures Banner (Table 12, P17 Blueprint) */}
      <aside aria-label="Prototype demo indicator" className="bg-[#151C2F] border-b border-[#334155] py-2 px-4 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[#F8FAFC]">Demonstration Environment:</span>
            <span>All campus events and venues shown are consented demonstration models for INT335.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[#38BDF8]">Campus: LPU Phagwara</span>
            <span className="text-[#334155]">|</span>
            <span className="font-mono text-[#94A3B8]">v1.0-p17</span>
          </div>
        </div>
      </aside>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#334155]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#7C5CFC_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151C2F] border border-[#7C5CFC]/40 text-[#38BDF8] text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#7C5CFC]" />
              <span>CampusPulse · Relevant Event Discovery & Scheduling Conflict Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-tight">
              Your Campus. Your Interests. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFC] to-[#38BDF8]">Your Next Experience.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              Find events that match your interests without digging through endless WhatsApp forwards and poster walls. For organizers, publish with instant venue double-booking and audience clash checks.
            </p>

            {/* 3 & 4. Primary and Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/discover">
                <Button variant="primary" size="lg" className="gap-2 text-sm shadow-xl shadow-[#7C5CFC]/25">
                  <Compass className="w-5 h-5" />
                  Explore Campus Events
                </Button>
              </Link>

              <Link to={currentUser?.role === 'organizer' ? '/organizer/create' : '/organizer'}>
                <Button variant="secondary" size="lg" className="gap-2 text-sm">
                  <Building className="w-4 h-4 text-[#38BDF8]" />
                  Organise an Event
                </Button>
              </Link>

              <Link to="/calendar" className="text-xs font-semibold text-[#94A3B8] hover:text-[#38BDF8] px-3 py-2 flex items-center gap-1 transition">
                <Calendar className="w-4 h-4" />
                View Master Calendar
              </Link>
            </div>

            {/* Value Highlights */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-[#334155] text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified Official Organisers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Zero Room Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-[#7C5CFC] shrink-0" />
                <span>Zero Mandatory Account Barrier</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Spotlight Event */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C5CFC]">Spotlight Showcase</span>
            <h2 className="text-2xl font-bold text-[#F8FAFC] mt-1">Featured Campus Experience</h2>
          </div>
          <Link to="/discover" className="text-xs font-bold text-[#38BDF8] hover:text-cyan-300 flex items-center gap-1">
            Browse All {publishedEvents.length} Events <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingIndicator label="Loading spotlight event..." />
        ) : featuredEvent ? (
          <div className="bg-[#151C2F] rounded-3xl border border-[#334155] overflow-hidden shadow-2xl hover:border-[#7C5CFC]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 h-64 lg:h-auto relative overflow-hidden bg-[#0B1020]">
              <img
                src={featuredEvent.cover_image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant="primary" size="md">Editor's Choice</Badge>
                <Badge variant="neutral" size="md">Demo Record</Badge>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] mb-2.5">
                  <span className="text-[#38BDF8]">{featuredEvent.organization?.name}</span>
                  <span className="text-[#334155]">•</span>
                  <Badge variant="success">Approved by Admin</Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] hover:text-[#38BDF8] transition">
                  <Link to={`/events/${featuredEvent.id}`}>{featuredEvent.title}</Link>
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-[#94A3B8] line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 space-y-2 text-xs text-[#94A3B8] bg-[#0B1020]/60 p-4 rounded-xl border border-[#334155]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#38BDF8]" />
                    <span className="font-semibold text-[#F8FAFC]">
                      {new Date(featuredEvent.start_time).toLocaleString('en-IN', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#94A3B8]">Venue:</span>
                    <span className="text-[#F8FAFC]">{featuredEvent.venue?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#334155] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#94A3B8]">Admission:</span>
                  <span className="ml-1.5 text-sm font-bold text-emerald-400">{featuredEvent.cost}</span>
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
      <section className="bg-[#151C2F]/40 py-14 border-y border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">Browse by Interest</h2>
              <p className="text-xs text-[#94A3B8] mt-1">Select an interest to filter events with transparent category rules</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedCategory === 'All'
                    ? 'bg-[#7C5CFC] text-white shadow-md'
                    : 'bg-[#151C2F] text-[#94A3B8] hover:bg-[#1E293B] border border-[#334155]'
                }`}
              >
                All Topics
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedCategory === c.label
                      ? 'bg-[#7C5CFC] text-white shadow-md'
                      : 'bg-[#151C2F] text-[#94A3B8] hover:bg-[#1E293B] border border-[#334155]'
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-[#151C2F] via-[#1E293B] to-[#151C2F] rounded-3xl border border-[#7C5CFC]/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <Badge variant="secondary" size="md">For Campus Club Organisers</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 leading-tight text-[#F8FAFC]">
              Publish events without conflicting with other societies.
            </h2>
            <p className="mt-3 text-[#94A3B8] text-sm leading-relaxed">
              CampusPulse runs mathematical interval checks (<code className="text-xs bg-[#0B1020] px-1.5 py-0.5 rounded text-[#38BDF8]">A.start &lt; B.end AND B.start &lt; A.end</code>) against authoritative room reservations and alerts you if another event targets the same student audience.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/organizer/clashes">
                <Button variant="primary" size="md" className="gap-2">
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
      <footer className="bg-[#151C2F] text-[#94A3B8] text-xs py-10 border-t border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#334155]">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#7C5CFC] to-[#38BDF8] flex items-center justify-center font-bold text-white text-xs">
                  P
                </div>
                <span className="font-extrabold text-sm text-[#F8FAFC]">CampusPulse</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] max-w-sm leading-relaxed">
                Campus-first event discovery and scheduling awareness platform built for the INT335 Design Thinking project.
              </p>
              <p className="text-[10px] text-[#94A3B8]/70">
                All event listings and venue reservations are demonstration data.
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-[#F8FAFC] text-xs mb-2">Platform</h4>
              <div><Link to="/discover" className="hover:text-[#F8FAFC]">Event Catalogue</Link></div>
              <div><Link to="/calendar" className="hover:text-[#F8FAFC]">Master Calendar</Link></div>
              <div><Link to="/clubs" className="hover:text-[#F8FAFC]">Clubs & Societies</Link></div>
              <div><Link to="/organizer" className="hover:text-[#F8FAFC]">Organizer Studio</Link></div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-[#F8FAFC] text-xs mb-2">Governance & Policies</h4>
              <div><a href="#privacy" className="hover:text-[#F8FAFC]">Privacy & Data Policy</a></div>
              <div><a href="#rls" className="hover:text-[#F8FAFC]">Row Level Security (RLS)</a></div>
              <div><a href="#conflicts" className="hover:text-[#F8FAFC]">Clash Policy Rules</a></div>
              <div><a href="#report" className="hover:text-[#F8FAFC]">Report Outdated Listing</a></div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#94A3B8]">
            <div>© 2026 CampusPulse Project (INT335 P17). All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>Timezone: <strong>Asia/Kolkata (IST)</strong></span>
              <span>Campus: <strong>LPU Phagwara</strong></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
