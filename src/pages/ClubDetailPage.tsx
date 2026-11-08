import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Building, 
  Mail, 
  ShieldCheck, 
  Users, 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Check, 
  Share2, 
  Globe, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, EmptyState } from '../components/ui';

export const ClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    organizations, 
    events, 
    currentUser, 
    toggleFollowOrganization, 
    isOrganizationFollowed 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'about'>('upcoming');

  const org = organizations.find(o => o.id === id || o.slug === id);

  if (!org) {
    return (
      <div className="min-h-screen text-[#11152B] py-16 px-4">
        <EmptyState
          title="Campus Chapter Not Found"
          description="The student club or society profile you requested does not exist or has been archived."
          actionLabel="Browse All Clubs"
          onAction={() => window.location.href = '/clubs'}
        />
      </div>
    );
  }

  const isFollowing = isOrganizationFollowed(org.id);

  // Split published events into upcoming and past
  const now = new Date().getTime();
  const orgEvents = events.filter(e => e.organization_id === org.id && e.status === 'published');
  
  const upcomingEvents = orgEvents.filter(e => new Date(e.end_time).getTime() >= now);
  const pastEvents = orgEvents.filter(e => new Date(e.end_time).getTime() < now);

  return (
    <div className="min-h-screen text-[#11152B] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#687087]">
          <Link to="/clubs" className="hover:text-[#5145E5] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Campus Chapters</span>
          </Link>
          <span>/</span>
          <span className="text-[#11152B]">{org.name}</span>
        </div>

        {/* Club Hero Banner */}
        <section className="bg-white rounded-3xl border border-[#E7E9F0] overflow-hidden shadow-xs">
          {/* Banner cover */}
          <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-[#5145E5] via-[#4338CA] to-[#11152B] relative">
            {org.banner_url && (
              <img 
                src={org.banner_url} 
                alt={`${org.name} cover`} 
                className="w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#11152B] font-mono text-xs font-bold uppercase shadow-xs">
                {org.type}
              </span>
              {org.is_verified && (
                <span className="px-3 py-1 rounded-full bg-[#16A36A] text-white font-mono text-xs font-bold flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
          </div>

          {/* Profile Identity Bar */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              <div className="flex items-end gap-4">
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover bg-white p-1 border-4 border-white shadow-md shrink-0"
                />
                <div className="mb-1 space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#11152B] tracking-tight">
                    {org.name}
                  </h1>
                  <p className="text-xs text-[#687087] flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#5145E5]" />
                    <span>{org.member_count || 120} Active Student Members</span>
                    <span>·</span>
                    <span>Lead: {org.lead_name}</span>
                  </p>
                </div>
              </div>

              {/* Follow / Bookmark Action */}
              <div className="flex items-center gap-3">
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => toggleFollowOrganization(org.id)}
                  className={`gap-2 cursor-pointer active-press ${
                    isFollowing 
                      ? 'border-[#5145E5] text-[#5145E5] bg-[#F0EDFF]' 
                      : 'bg-[#5145E5] hover:bg-[#4338CA] text-white shadow-xs'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="w-4 h-4 text-[#5145E5]" />
                      <span>Following Chapter</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C8F169]" />
                      <span>Follow Chapter</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Selection */}
        <div className="flex gap-2 border-b border-[#E7E9F0] pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF]'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'past'
                ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF]'
            }`}
          >
            Past Archives ({pastEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF]'
            }`}
          >
            About & Contacts
          </button>
        </div>

        {/* Content View */}
        <div>
          {activeTab === 'upcoming' && (
            <div>
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Upcoming Events Scheduled"
                  description={`${org.name} does not have any active upcoming events right now. Check back soon or follow to receive notifications.`}
                />
              )}
            </div>
          )}

          {activeTab === 'past' && (
            <div>
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No Past Event Records"
                  description="All historical events for this organization will appear here once completed."
                />
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9F0] shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#11152B]">About {org.name}</h3>
                <p className="text-sm text-[#687087] leading-relaxed whitespace-pre-wrap">
                  {org.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E7E9F0] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F7F8FC] space-y-1 border border-[#E7E9F0]">
                  <span className="font-mono text-[10px] uppercase text-[#9299AA]">Official Contact</span>
                  <div className="flex items-center gap-2 text-[#11152B] font-bold">
                    <Mail className="w-4 h-4 text-[#5145E5]" />
                    <a href={`mailto:${org.contact_email}`} className="hover:underline">{org.contact_email}</a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F8FC] space-y-1 border border-[#E7E9F0]">
                  <span className="font-mono text-[10px] uppercase text-[#9299AA]">Executive Chapter Lead</span>
                  <div className="flex items-center gap-2 text-[#11152B] font-bold">
                    <Users className="w-4 h-4 text-[#5145E5]" />
                    <span>{org.lead_name}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default ClubDetailPage;
