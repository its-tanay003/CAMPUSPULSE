import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  Layers, 
  BarChart3,
  XCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OrganizerDashboardPage: React.FC = () => {
  const { events, currentUser, cancelEvent } = useApp();

  // All events managed by organizer
  const myEvents = events.filter(e => e.created_by === currentUser?.id || currentUser?.role === 'admin');

  const publishedCount = myEvents.filter(e => e.status === 'published').length;
  const pendingCount = myEvents.filter(e => e.status === 'pending_review').length;
  const draftCount = myEvents.filter(e => e.status === 'draft').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Organizer Workspace
              </span>
              <span className="text-xs text-slate-400">· {currentUser?.full_name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              Organizer Operations Studio
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft, submit for administrative review, and inspect real-time schedule conflict warnings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/organizer/clashes"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Conflict Radar
            </Link>
            <Link
              to="/organizer/create"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Real Metrics Cards as per Table 28 / Table 16 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{publishedCount}</div>
              <div className="text-xs text-slate-500 font-medium">Published & Live Events</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
              <div className="text-xs text-slate-500 font-medium">Under Admin Review</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{draftCount}</div>
              <div className="text-xs text-slate-500 font-medium">Draft Event In-Progress</div>
            </div>
          </div>
        </div>

        {/* Event Lifecycle Directory */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base">Club Event Catalogue</h2>
            <span className="text-xs text-slate-500 font-medium">{myEvents.length} total listings</span>
          </div>

          <div className="divide-y divide-slate-100">
            {myEvents.map(event => {
              const startDate = new Date(event.start_time);

              return (
                <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        event.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : event.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-800'
                          : event.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {event.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{event.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500">{event.venue?.name}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      <Link to={`/events/${event.id}`} className="hover:text-blue-600">
                        {event.title}
                      </Link>
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-4 pt-1">
                      <span>Schedule: {startDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span>Page Views: {event.views_count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg transition"
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
                        className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg font-semibold transition"
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

