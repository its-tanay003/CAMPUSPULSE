import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClubsDirectoryPage: React.FC = () => {
  const { organizations, events } = useApp();

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
            Campus Clubs & Student Organizations
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Authoritative registry of verified student chapters, technical societies, and cultural guilds.
          </p>
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map(org => {
            const orgEvents = events.filter(e => e.organization_id === org.id && e.status === 'published');

            return (
              <div
                key={org.id}
                className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md hover:border-[#7C5CFC]/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-[#334155] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0B1020] text-[#38BDF8] border border-[#334155]">
                          {org.type}
                        </span>
                        {org.is_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-[#F8FAFC] text-lg mt-1">{org.name}</h2>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs text-[#94A3B8] leading-relaxed line-clamp-3">
                    {org.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#334155] grid grid-cols-2 gap-2 text-xs text-[#94A3B8]">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>{org.member_count || 100}+ Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#7C5CFC]" />
                      <span className="truncate">{org.contact_email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#334155] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F8FAFC]">
                    {orgEvents.length} Active {orgEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                  <Link
                    to={`/discover?org=${org.id}`}
                    className="text-xs font-bold text-[#38BDF8] hover:text-cyan-300 flex items-center gap-1 transition"
                  >
                    View Activities <ArrowRight className="w-3.5 h-3.5" />
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
