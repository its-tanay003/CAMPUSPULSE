import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClubsDirectoryPage: React.FC = () => {
  const { organizations, events, toggleFollowOrganization, isOrganizationFollowed } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase()) || 
                          org.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || org.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen text-[#11152B] py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E9F0] shadow-xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EDFF] text-[#5145E5] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Community Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#11152B] tracking-tight">
            Clubs, Societies & Student Chapters
          </h1>
          <p className="text-xs sm:text-sm text-[#687087] max-w-2xl leading-relaxed">
            Discover verified campus organizations, follow your favorite chapters, and never miss an official hackathon or technical symposium.
          </p>

          {/* Search & Filter Controls */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9299AA]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chapters by name or focus..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F7F8FC] border border-[#E7E9F0] rounded-2xl text-[#11152B] focus:outline-none focus:ring-2 focus:ring-[#5145E5]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
              {(['all', 'club', 'society', 'department', 'cell'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl capitalize transition cursor-pointer shrink-0 ${
                    selectedType === type
                      ? 'bg-[#5145E5] text-white shadow-xs font-bold'
                      : 'bg-[#F7F8FC] text-[#687087] hover:bg-[#F0EDFF]'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrgs.map(org => {
            const orgEvents = events.filter(e => e.organization_id === org.id && e.status === 'published');
            const isFollowing = isOrganizationFollowed(org.id);

            return (
              <div
                key={org.id}
                className="cp-card p-6 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={org.logo_url}
                        alt={`Logo for ${org.name}`}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#E7E9F0] shrink-0"
                        loading="lazy"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0EDFF] text-[#5145E5] border border-[#5145E5]/20">
                            {org.type}
                          </span>
                          {org.is_verified && (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#16A36A]/10 text-[#16A36A] border border-[#16A36A]/30 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#16A36A]" /> Verified
                            </span>
                          )}
                        </div>
                        <h2 className="font-extrabold text-[#11152B] text-lg mt-1.5 leading-snug">
                          <Link to={`/clubs/${org.id}`} className="hover:text-[#5145E5]">
                            {org.name}
                          </Link>
                        </h2>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollowOrganization(org.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer active-press shrink-0 ${
                        isFollowing
                          ? 'bg-[#F0EDFF] text-[#5145E5] border-[#5145E5]/30'
                          : 'bg-[#F7F8FC] text-[#687087] border-[#E7E9F0] hover:bg-[#F0EDFF] hover:text-[#5145E5]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  <p className="mt-3.5 text-xs text-[#687087] leading-relaxed line-clamp-3">
                    {org.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#E7E9F0] grid grid-cols-2 gap-2 text-xs text-[#687087]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#5145E5]" />
                      <span>{org.member_count || 100}+ Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#5145E5]" />
                      <span className="truncate">{org.contact_email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E7E9F0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#11152B]">
                    <span className="font-mono text-[#5145E5] font-bold">{orgEvents.length}</span> Active {orgEvents.length === 1 ? 'Event' : 'Events'}
                  </span>

                  <Link
                    to={`/clubs/${org.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5145E5] hover:text-[#4338CA] transition group"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
export default ClubsDirectoryPage;
