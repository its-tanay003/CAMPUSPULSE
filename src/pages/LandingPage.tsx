import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { EventCategory } from '../types';

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
  const upcomingEvents = publishedEvents.slice(1, 4);

  const filteredUpcoming = selectedInterest === 'All'
    ? publishedEvents.slice(0, 6)
    : publishedEvents.filter(e => e.category === selectedInterest);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-[#0B192C] text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>P17 Design Solution: Cut through campus poster noise</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Campus. Your Interests. <span className="text-[#FF6500]">Your Next Experience.</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
              One authoritative campus feed, personal agenda synchronization, and transparent clash detection for student organizers. Never miss what matters at campus.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/discover"
                className="bg-[#FF6500] hover:bg-[#e05800] text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 focus:ring-4 focus:ring-amber-500/30"
              >
                <Compass className="w-5 h-5" />
                Explore Campus Events
              </Link>
              <Link
                to="/calendar"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-6 py-3.5 rounded-xl transition flex items-center gap-2"
              >
                <Calendar className="w-5 h-5 text-amber-400" />
                View Master Calendar
              </Link>
              {currentUser?.role === 'organizer' ? (
                <Link
                  to="/organizer/create"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl transition flex items-center gap-2"
                >
                  Post Club Event
                </Link>
              ) : (
                <Link
                  to="/organizer"
                  className="text-slate-300 hover:text-white px-4 py-3.5 flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                  For Club Organisers →
                </Link>
              )}
            </div>

            {/* Quick Metrics from Blueprint */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified Official Organisers</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Zero Double-Booking Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>No Mandatory Account Gate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spotlight Section */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Spotlight Event</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Featured Campus Experience</h2>
            </div>
            <Link to="/discover" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 h-64 lg:h-auto relative overflow-hidden bg-slate-900">
              <img
                src={featuredEvent.cover_image}
                alt={featuredEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-[#FF6500] text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  Editor's Choice
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                  <span>{featuredEvent.organization?.name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Approved Listing</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 hover:text-blue-600 transition">
                  <Link to={`/events/${featuredEvent.id}`}>{featuredEvent.title}</Link>
                </h3>

                <p className="mt-3 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="mt-6 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">
                      {new Date(featuredEvent.start_time).toLocaleString('en-IN', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Venue:</span>
                    <span>{featuredEvent.venue?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600">{featuredEvent.cost}</span>
                <Link
                  to={`/events/${featuredEvent.id}`}
                  className="bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
                >
                  View Details & Register →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Browse by Interest Categories */}
      <section className="bg-slate-100/70 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Browse by Interest</h2>
              <p className="text-xs text-slate-500 mt-1">Select a category to filter upcoming activities</p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedInterest('All')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedInterest === 'All'
                    ? 'bg-[#0B192C] text-white shadow'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Topics
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.label}
                  onClick={() => setSelectedInterest(c.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedInterest === c.label
                      ? 'bg-[#0B192C] text-white shadow'
                      : 'bg-white text-slate-600 hover:bg-slate-200'
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

          <div className="text-center mt-10">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-6 py-2.5 rounded-xl text-sm shadow-sm transition"
            >
              Browse Full Event Catalogue ({events.length} listings) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* P17 Clash Prevention Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              The P17 Innovation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 leading-tight">
              Organisers no longer have to shout or guess clashes.
            </h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              CampusPulse runs live venue reservation checks (<code>A.start &lt; B.end AND B.start &lt; A.end</code>) and audience collision alerts before submission. Spot conflicts in real-time, avoid double-bookings, and coordinate seamlessly.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/organizer/clashes"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-xs shadow transition flex items-center gap-2"
              >
                Launch Live Clash Demo →
              </Link>
              <Link
                to="/organizer/create"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg text-xs border border-white/20 transition"
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

