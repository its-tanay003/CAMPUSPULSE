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
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Campus Ecosystem</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1.5">
            Campus Clubs & Student Organizations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
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
                className="glass-card rounded-3xl p-6 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={org.logo_url}
                      alt={`Logo for ${org.name}`}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white text-indigo-600 border border-slate-200">
                          {org.type}
                        </span>
                        {org.is_verified && (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-white text-lg mt-1.5">{org.name}</h2>
                    </div>
                  </div>

                  <p className="mt-3.5 text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {org.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{org.member_count || 100}+ Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{org.contact_email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">
                    <span className="font-mono text-indigo-600 font-bold">{orgEvents.length}</span> Active {orgEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                  <Link
                    to={`/discover?org=${org.id}`}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-600 flex items-center gap-1 transition"
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
