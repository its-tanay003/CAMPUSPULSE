import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrganizerDashboardPage: React.FC = () => {
  const { events, currentUser, cancelEvent } = useApp();

  const myEvents = events.filter(e => e.created_by === currentUser?.id || currentUser?.role === 'admin');

  const publishedCount = myEvents.filter(e => e.status === 'published').length;
  const pendingCount = myEvents.filter(e => e.status === 'pending_review').length;
  const draftCount = myEvents.filter(e => e.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Organizer Workspace
              </span>
              <span className="text-xs text-[#94A3B8]">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1 tracking-tight">
              Organizer Operations Studio
            </h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Draft, submit for administrative review, and inspect real-time schedule conflict warnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/organizer/clashes"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <AlertTriangle className="w-4 h-4 text-[#38BDF8]" />
              Conflict Radar
            </Link>
            <Link
              to="/organizer/create"
              className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Real Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#151C2F] p-5 rounded-2xl border border-[#334155] shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#F8FAFC]">{publishedCount}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Published & Live Events</div>
            </div>
          </div>

          <div className="bg-[#151C2F] p-5 rounded-2xl border border-[#334155] shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#F8FAFC]">{pendingCount}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Under Admin Review</div>
            </div>
          </div>

          <div className="bg-[#151C2F] p-5 rounded-2xl border border-[#334155] shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0B1020] border border-[#334155] text-[#94A3B8] flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#F8FAFC]">{draftCount}</div>
              <div className="text-xs text-[#94A3B8] font-medium">Draft Events In-Progress</div>
            </div>
          </div>
        </div>

        {/* Event Lifecycle Directory */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-5 border-b border-[#334155] flex items-center justify-between">
            <h2 className="font-bold text-[#F8FAFC] text-base">Club Event Catalogue</h2>
            <span className="text-xs text-[#94A3B8] font-medium">{myEvents.length} total listings</span>
          </div>

          <div className="divide-y divide-[#334155]">
            {myEvents.map(event => {
              const startDate = new Date(event.start_time);

              return (
                <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E293B]/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        event.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : event.status === 'pending_review'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : event.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-[#0B1020] text-[#94A3B8] border-[#334155]'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-[#38BDF8]">{event.category}</span>
                      <span className="text-[#334155]">·</span>
                      <span className="text-xs text-[#94A3B8]">{event.venue?.name}</span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base">
                      <Link to={`/events/${event.id}`} className="hover:text-[#38BDF8] transition">
                        {event.title}
                      </Link>
                    </h3>

                    <div className="text-xs text-[#94A3B8] flex items-center gap-4 pt-1">
                      <span>Schedule: {startDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>Page Views: {event.views_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition"
                    >
                      Preview Page
                    </Link>
                    {event.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to cancel "${event.title}"?`)) {
                            cancelEvent(event.id);
                          }
                        }}
                        className="text-xs text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl font-semibold transition border border-transparent hover:border-rose-500/20"
                      >
                        Cancel Event
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
