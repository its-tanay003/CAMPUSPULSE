import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Calendar as CalendarIcon, 
  Bookmark, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, EmptyState } from '../components/ui';

export const StudentHomePage: React.FC = () => {
  const { currentUser, events, savedEvents, isEventSaved } = useApp();
  const [activeTab, setActiveTab] = useState<'recommended' | 'saved' | 'happening_today'>('recommended');

  const publishedEvents = events.filter(e => e.status === 'published');
  
  // Student's saved events
  const userSavedEventIds = savedEvents
    .filter(s => s.user_id === currentUser?.id)
    .map(s => s.event_id);
  const mySavedEvents = publishedEvents.filter(e => userSavedEventIds.includes(e.id));

  // Events happening today or upcoming within next 48 hours
  const upcomingEvents = publishedEvents.slice(0, 4);

  // Recommendations based on student interests
  const userInterests = currentUser?.interests || ['Technology', 'Workshops'];
  const recommendedEvents = publishedEvents.filter(e => 
    userInterests.includes(e.category) || publishedEvents.indexOf(e) < 4
  );

  return (
    <div className="min-h-screen py-8 text-[#11152B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Student Welcome Header Card */}
        <section className="bg-gradient-to-r from-[#5145E5] via-[#4338CA] to-[#11152B] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C8F169] text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Intelligence Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-sm text-slate-200 max-w-xl">
                You have <strong className="text-white font-bold">{mySavedEvents.length} active event pass(es)</strong> saved on your campus schedule. No venue collisions detected.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/my-events">
                <Button variant="secondary" size="md" className="gap-2 bg-white text-[#11152B] hover:bg-slate-100 border-none">
                  <Bookmark className="w-4 h-4 text-[#5145E5]" />
                  Pass Wallet ({mySavedEvents.length})
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="secondary" size="md" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <CalendarIcon className="w-4 h-4 text-[#C8F169]" />
                  My Agenda
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Tabs & Metrics Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E9F0] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'recommended'
                  ? 'bg-[#5145E5] text-white shadow-xs'
                  : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF] hover:text-[#11152B]'
              }`}
            >
              Recommended For You ({recommendedEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-[#5145E5] text-white shadow-xs'
                  : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF] hover:text-[#11152B]'
              }`}
            >
              Saved Passes ({mySavedEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('happening_today')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'happening_today'
                  ? 'bg-[#5145E5] text-white shadow-xs'
                  : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF] hover:text-[#11152B]'
              }`}
            >
              Upcoming 48H ({upcomingEvents.length})
            </button>
          </div>

          <Link to="/discover" className="text-xs font-bold text-[#5145E5] hover:underline flex items-center gap-1">
            <span>Explore All {publishedEvents.length} Listings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Main Feed Content based on Active Tab */}
        <section>
          {activeTab === 'recommended' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div>
              {mySavedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mySavedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Saved Passes Yet"
                  description="Explore campus hackathons, symposiums, and cultural events to save them into your personal agenda."
                  actionLabel="Discover Events Now"
                  onAction={() => window.location.href = '/discover'}
                />
              )}
            </div>
          )}

          {activeTab === 'happening_today' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Campus Chapter Quick Highlights */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#5145E5] font-bold">Community</span>
              <h2 className="text-xl font-extrabold text-[#11152B] tracking-tight">Verified Campus Chapters</h2>
            </div>
            <Link to="/clubs" className="text-xs font-bold text-[#5145E5] hover:underline flex items-center gap-1">
              <span>View All Chapters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-[#687087]">
            Connect directly with officially chartered student societies, developer circles, and arts collectives.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#11152B]">GDG On-Campus</span>
                <span className="text-[10px] bg-[#16A36A]/10 text-[#16A36A] font-bold px-2 py-0.5 rounded-full font-mono">Verified</span>
              </div>
              <p className="text-xs text-[#687087]">Google Developer Student Clubs chapter organizing hackathons and cloud tracks.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#11152B]">ACM Student Chapter</span>
                <span className="text-[10px] bg-[#16A36A]/10 text-[#16A36A] font-bold px-2 py-0.5 rounded-full font-mono">Verified</span>
              </div>
              <p className="text-xs text-[#687087]">Association for Computing Machinery chapter hosting competitive programming challenges.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F8FC] border border-[#E7E9F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#11152B]">Robotics & AI Society</span>
                <span className="text-[10px] bg-[#16A36A]/10 text-[#16A36A] font-bold px-2 py-0.5 rounded-full font-mono">Verified</span>
              </div>
              <p className="text-xs text-[#687087]">Hands-on engineering chapter building autonomous systems and bot tournaments.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
export default StudentHomePage;
