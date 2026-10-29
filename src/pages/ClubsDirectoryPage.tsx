import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, 
  Users, 
  CheckCircle2, 
  Mail, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClubsDirectoryPage: React.FC = () => {
  const { organizations, events } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Clubs & Student Organizations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {org.type}
                        </span>
                        {org.is_verified && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
                          </span>
                        )}
                      </div>
                      <h2 className="font-bold text-slate-900 text-lg mt-1">{org.name}</h2>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {org.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{org.member_count || 100}+ Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{org.contact_email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    {orgEvents.length} Active {orgEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                  <Link
                    to={`/discover?org=${org.id}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
