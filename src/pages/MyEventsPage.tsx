import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateICS } from '../lib/icsExport';

export const MyEventsPage: React.FC = () => {
  const { 
    events, 
    savedEvents, 
    registrations, 
    currentUser, 
    toggleSaveEvent 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'saved' | 'registered'>('saved');

  const userSaved = savedEvents
    .filter(s => s.user_id === currentUser?.id)
    .map(s => events.find(e => e.id === s.event_id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const userRegistered = registrations
    .filter(r => r.user_id === currentUser?.id)
    .map(r => ({
      reg: r,
      event: events.find(e => e.id === r.event_id)
    }))
    .filter((item): item is { reg: typeof item.reg; event: NonNullable<typeof item.event> } => Boolean(item.event));

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                My Campus Schedule
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Distinguishing saved bookmark bookmarks from confirmed event registrations.
              </p>
            </div>

            <div className="flex bg-[#0B1020] p-1.5 rounded-xl border border-[#334155] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#38BDF8]" />
                Saved Bookmarks ({userSaved.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'registered'
                    ? 'bg-[#7C5CFC] text-white shadow font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confirmed Registrations ({userRegistered.length})
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Saved Events */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {userSaved.length > 0 ? (
              userSaved.map(event => (
                <div
                  key={event.id}
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-[#7C5CFC]/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
                      <span className="font-semibold text-[#38BDF8]">{event.category}</span>
                      <span>•</span>
                      <span>{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base hover:text-[#38BDF8] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="mt-2 text-xs text-[#94A3B8] space-x-3">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <button
                      onClick={() => generateICS(event)}
                      className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition flex items-center gap-1"
                      title="Export .ics"
                    >
                      <Download className="w-3.5 h-3.5" /> .ics
                    </button>
                    <button
                      onClick={() => toggleSaveEvent(event.id)}
                      className="text-xs text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition flex items-center gap-1 border border-transparent hover:border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#7C5CFC] text-white px-4 py-2 rounded-xl font-bold shadow"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow">
                <Bookmark className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
                <h3 className="text-base font-bold text-[#F8FAFC]">No saved events yet</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
                  Keep track of interesting workshops or concerts by clicking the bookmark button on any event card.
                </p>
                <Link
                  to="/discover"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#7C5CFC] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
                >
                  <Compass className="w-3.5 h-3.5" /> Browse Discover
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Registered Events */}
        {activeTab === 'registered' && (
          <div className="space-y-4">
            {userRegistered.length > 0 ? (
              userRegistered.map(({ reg, event }) => (
                <div
                  key={reg.id}
                  className="bg-[#151C2F] rounded-2xl border border-[#334155] p-5 shadow-sm hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {reg.status}
                      </span>
                      <span className="text-[#334155]">·</span>
                      <span className="text-[#94A3B8] font-mono text-[11px]">Ticket Pass: {reg.id}</span>
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base hover:text-[#38BDF8] transition">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="mt-2 text-xs text-[#94A3B8] space-x-3">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>

                    {reg.notes && (
                      <div className="mt-2 text-xs text-[#94A3B8] bg-[#0B1020] p-2.5 rounded-xl border border-[#334155]">
                        <strong className="text-[#F8FAFC]">Pass Notes:</strong> {reg.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <button
                      onClick={() => generateICS(event)}
                      className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Calendar
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#7C5CFC] text-white px-4 py-2 rounded-xl font-bold shadow"
                    >
                      Pass & Venue Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#94A3B8] mb-3" />
                <h3 className="text-base font-bold text-[#F8FAFC]">No confirmed registrations</h3>
                <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1">
                  When you register for workshops, hackathons, or competitions, your admission details and confirmation passes appear here.
                </p>
                <Link
                  to="/discover"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#7C5CFC] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
                >
                  <Compass className="w-3.5 h-3.5" /> Discover Events
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
