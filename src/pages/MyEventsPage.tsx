import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Compass, 
  Calendar,
  AlertCircle
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

  // Filter for this user's data
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Campus Schedule
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Distinguishing saved bookmark bookmarks from confirmed event registrations.
              </p>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'saved'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                Saved Bookmarks ({userSaved.length})
              </button>
              <button
                onClick={() => setActiveTab('registered')}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'registered'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
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
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{event.category}</span>
                      <span>•</span>
                      <span>{event.organization?.name}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base hover:text-blue-600">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="mt-2 text-xs text-slate-600 space-x-3">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button
                      onClick={() => generateICS(event)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1"
                      title="Export .ics"
                    >
                      <Download className="w-3.5 h-3.5" /> .ics
                    </button>
                    <button
                      onClick={() => toggleSaveEvent(event.id)}
                      className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#0B192C] text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Bookmark className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-900">No saved events yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Keep track of interesting workshops or concerts by clicking the bookmark button on any event card.
                </p>
                <Link
                  to="/discover"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#0B192C] text-white text-xs font-semibold px-4 py-2 rounded-lg"
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
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {reg.status}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-medium">Ticket: {reg.id}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base hover:text-blue-600">
                      <Link to={`/events/${event.id}`}>{event.title}</Link>
                    </h3>

                    <div className="mt-2 text-xs text-slate-600 space-x-3">
                      <span>{new Date(event.start_time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>·</span>
                      <span>{event.venue?.name}</span>
                    </div>

                    {reg.notes && (
                      <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded">
                        <strong>Pass Notes:</strong> {reg.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button
                      onClick={() => generateICS(event)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Calendar
                    </button>
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#0B192C] text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Pass & Venue Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-900">No confirmed registrations</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  When you register for workshops, hackathons, or competitions, your admission details and confirmation passes appear here.
                </p>
                <Link
                  to="/discover"
                  className="mt-4 inline-flex items-center gap-1.5 bg-[#0B192C] text-white text-xs font-semibold px-4 py-2 rounded-lg"
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
