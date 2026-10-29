import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import type { EventCategory } from '../types';

const CATEGORIES: { label: EventCategory; desc: string; icon: string }[] = [
  { label: 'Technology', desc: 'AI, coding, hackathons & robotics', icon: '💻' },
  { label: 'Workshops', desc: 'Hands-on practical skill sessions', icon: '🛠️' },
  { label: 'Cultural', desc: 'Theatre, poetry, drama & arts', icon: '🎭' },
  { label: 'Music', desc: 'Unplugged concerts & acoustic jams', icon: '🎵' },
  { label: 'Sports', desc: 'Hostel leagues, badminton & tournaments', icon: '🏸' },
  { label: 'Research', desc: 'Symposiums & tech paper presentations', icon: '🔬' },
];

export const LandingPage: React.FC = () => {
  const { events, currentUser } = useApp();
  const [selectedInterest, setSelectedInterest] = useState<string>('All');

  const publishedEvents = events.filter(e => e.status === 'published');
  const featuredEvent = publishedEvents[0];

  const filteredUpcoming = selectedInterest === 'All'
    ? publishedEvents.slice(0, 6)
    : publishedEvents.filter(e => e.category === selectedInterest);

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#334155]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#7C5CFC_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151C2F] border border-[#7C5CFC]/30 text-[#38BDF8] text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#7C5CFC]" />
              <span>P17 Solution: Cut through campus poster clutter</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F8FAFC] leading-tight">
              Your Campus. Your Interests. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFC] to-[#38BDF8]">Your Next Experience.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#94A3B8] leading-relaxed">
              One central campus feed, personal agenda synchronization, and transparent clash detection for student organizers. Never miss what matters at campus.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/discover"
                className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
              >
                <Compass className="w-5 h-5" />
                Explore Campus Events
              </Link>
              <Link
                to="/calendar"
                className="bg-[#151C2F] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold px-6 py-3.5 rounded-xl transition flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-5 h-5 text-[#38BDF8]" />
                View Master Calendar
              </Link>
              {currentUser?.role === 'organizer' ? (
                <Link
                  to="/organizer/create"
                  className="bg-[#38BDF8]/20 border border-[#38BDF8]/40 hover:bg-[#38BDF8]/30 text-[#38BDF8] font-bold px-6 py-3.5 rounded-xl transition flex items-center gap-2"
                >
                  Post Club Event
                </Link>
              ) : (
                <Link
                  to="/organizer"
                  className="text-[#94A3B8] hover:text-[#F8FAFC] px-4 py-3.5 flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  For Club Organisers →
                </Link>
              )}
            </div>

            {/* Value Guarantees */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-[#334155] text-xs text-[#94A3B8]">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified Official Organisers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38BDF8]" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7C5CFC]" />
                <span>No Mandatory Account Gate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Section */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C5CFC]">Spotlight Event</span>
              <h2 className="text-2xl font-bold text-[#F8FAFC] mt-1">Featured Campus Experience</h2>
            </div>
            <Link to="/discover" className="text-xs font-bold text-[#38BDF8] hover:text-cyan-300 flex items-center gap-1">
              All Events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-xl hover:border-[#7C5CFC]/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 h-64 lg:h-auto relative overflow-hidden bg-[#0B1020]">
              <img
                src={featuredEvent.cover_image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-[#7C5CFC] text-white font-bold text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Editor's Choice
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#94A3B8] mb-2">
                  <span>{featuredEvent.organization?.name}</span>
                  <span className="text-[#334155]">•</span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-medium">Approved Listing</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC] hover:text-[#38BDF8] transition">
                  <Link to={`/events/${featuredEvent.id}`}>{featuredEvent.title}</Link>
                </h3>

                <p className="mt-3 text-sm text-[#94A3B8] line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 space-y-2 text-xs text-[#94A3B8]">
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
                <span className="text-sm font-bold text-emerald-400">{featuredEvent.cost}</span>
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow"
                >
                  View Details & Register →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Browse by Interest Categories */}
      <section className="bg-[#151C2F]/40 py-14 border-y border-[#334155]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">Browse by Interest</h2>
              <p className="text-xs text-[#94A3B8] mt-1">Select a category to filter upcoming activities</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedInterest('All')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  selectedInterest === 'All'
                    ? 'bg-[#7C5CFC] text-white shadow'
                    : 'bg-[#151C2F] text-[#94A3B8] hover:bg-[#1E293B] border border-[#334155]'
                }`}
              >
                All Topics
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  onClick={() => setSelectedInterest(c.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedInterest === c.label
                      ? 'bg-[#7C5CFC] text-white shadow'
                      : 'bg-[#151C2F] text-[#94A3B8] hover:bg-[#1E293B] border border-[#334155]'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUpcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-[#151C2F] hover:bg-[#1E293B] border border-[#334155] text-[#F8FAFC] font-bold px-6 py-3 rounded-xl text-xs shadow-md transition"
            >
              Browse Full Event Catalogue ({events.length} listings) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* P17 Clash Prevention Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#151C2F] to-[#1E293B] rounded-3xl border border-[#7C5CFC]/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
              The P17 Innovation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 leading-tight text-[#F8FAFC]">
              Organisers no longer have to shout or guess clashes.
            </h2>
            <p className="mt-3 text-[#94A3B8] text-sm leading-relaxed">
              CampusPulse runs live venue reservation checks (<code>A.start &lt; B.end AND B.start &lt; A.end</code>) and audience collision alerts before submission. Spot conflicts in real-time, avoid double-bookings, and coordinate seamlessly.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/organizer/clashes"
                className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold px-5 py-3 rounded-xl text-xs shadow-lg transition flex items-center gap-2"
              >
                Launch Live Clash Demo →
              </Link>
              <Link
                to="/organizer/create"
                className="bg-[#151C2F] hover:bg-[#1E293B] text-[#F8FAFC] font-semibold px-5 py-3 rounded-xl text-xs border border-[#334155] transition"
              >
                Create Event Draft
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
