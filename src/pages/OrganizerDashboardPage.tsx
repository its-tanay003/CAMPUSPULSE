import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Edit3, 
  Eye, 
  Filter, 
  ShieldAlert, 
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import { StatusTimeline } from '../components/StatusTimeline';
import type { EventStatus, CampusEvent } from '../types';

export const OrganizerDashboardPage: React.FC = () => {
  const { events, venues, currentUser, cancelEvent, getUserOrganizations, canManageEvent, approvals } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');
  const [selectedTimelineEvent, setSelectedTimelineEvent] = useState<CampusEvent | null>(null);

  // Authorized user organizations
  const userOrgs = getUserOrganizations(currentUser?.id);
  const userOrgIds = userOrgs.map(o => o.id);

  // Filter events belonging to clubs where the user is an active member or creator (or all for admin)
  const myEvents = events.filter(e => {
    if (currentUser?.role === 'admin') return true;
    return userOrgIds.includes(e.organization_id) || e.created_by === currentUser?.id;
  });

  // Accurate, non-fabricated metrics
  const draftCount = myEvents.filter(e => e.status === 'draft').length;
  const pendingCount = myEvents.filter(e => e.status === 'pending_review').length;
  const publishedCount = myEvents.filter(e => e.status === 'published').length;
  const changesRequestedCount = myEvents.filter(e => e.status === 'changes_requested').length;

  // Real unresolved conflict warnings across organizer's active events
  const conflictWarnings = myEvents
    .filter(e => ['draft', 'pending_review', 'published', 'changes_requested'].includes(e.status))
    .map(event => {
      const activeClashes = detectEventConflicts(
        {
          start_time: event.start_time,
          end_time: event.end_time,
          venue_id: event.venue_id,
          category: event.category
        },
        events,
        venues,
        event.id
      );
      return { event, clashes: activeClashes.conflicts };
    })
    .filter(item => item.clashes.length > 0);

  const unresolvedConflictCount = conflictWarnings.length;

  // Filtered listing
  const filteredEvents = myEvents.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (selectedOrgFilter !== 'all' && e.organization_id !== selectedOrgFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Workspace Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-indigo-500/20 text-cyan-300 border border-indigo-500/30 text-[10px] font-mono font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Authorized Organizer Workspace
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentUser?.full_name} ({currentUser?.role})
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Event Publishing & Scheduling Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Manage your club's event pipeline with strict database-level membership authorization, draft privacy, and pre-submission venue collision radar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/organizer/clashes"
              className="bg-[#050814]/80 hover:bg-[#0b1020] text-slate-200 border border-white/10 font-semibold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Conflict Radar ({unresolvedConflictCount})
            </Link>
            <Link
              to="/organizer/create"
              className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Real Metrics Grid - 5 Critical Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Drafts */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
            className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === 'draft'
                ? 'glass-card border-indigo-500/80 ring-2 ring-indigo-500/40 glow-indigo'
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-400">Private Drafts</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-white">{draftCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Only visible to your club</div>
            </div>
          </button>

          {/* Pending Review */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pending_review' ? 'all' : 'pending_review')}
            className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === 'pending_review'
                ? 'glass-card border-amber-500 ring-2 ring-amber-500/40'
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-amber-400">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-amber-300">{pendingCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Awaiting Admin DSW check</div>
            </div>
          </button>

          {/* Published */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
            className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === 'published'
                ? 'glass-card border-emerald-500 ring-2 ring-emerald-500/40'
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-emerald-400">Published Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-emerald-300">{publishedCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Discoverable to campus</div>
            </div>
          </button>

          {/* Requires Changes */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'changes_requested' ? 'all' : 'changes_requested')}
            className={`p-5 rounded-3xl border text-left transition flex flex-col justify-between cursor-pointer ${
              statusFilter === 'changes_requested'
                ? 'glass-card border-rose-500 ring-2 ring-rose-500/40'
                : 'glass-card border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-rose-400">Needs Changes</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-rose-300">{changesRequestedCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Admin feedback attached</div>
            </div>
          </button>

          {/* Conflict Warnings */}
          <div className="p-5 rounded-3xl border glass-card border-white/10 col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-cyan-400">Conflict Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-mono font-black text-amber-300">{unresolvedConflictCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Timing/venue overlap warnings</div>
            </div>
          </div>
        </div>

        {/* Unresolved Conflict Alert Callout */}
        {unresolvedConflictCount > 0 && (
          <div className="glass-card border-l-4 border-l-amber-500 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-amber-200 text-sm">
                  {unresolvedConflictCount} Active Event{unresolvedConflictCount > 1 ? 's Have' : ' Has'} Scheduling Overlaps
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Review potential venue double-bookings or concurrent category clashes before final admin approval.
                </p>
              </div>
            </div>
            <Link
              to="/organizer/clashes"
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2.5 rounded-2xl transition text-center shrink-0"
            >
              Open Conflict Radar →
            </Link>
          </div>
        )}

        {/* Controls Bar: Search & Filtering */}
        <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1 font-mono">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filters:
            </span>
            
            <select
              aria-label="Filter events by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-[#050814]/80 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses ({myEvents.length})</option>
              <option value="draft">Drafts ({draftCount})</option>
              <option value="pending_review">Pending Review ({pendingCount})</option>
              <option value="published">Published ({publishedCount})</option>
              <option value="changes_requested">Changes Requested ({changesRequestedCount})</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {userOrgs.length > 1 && (
              <select
                aria-label="Filter events by club organization"
                value={selectedOrgFilter}
                onChange={(e) => setSelectedOrgFilter(e.target.value)}
                className="text-xs bg-[#050814]/80 border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">All My Clubs ({userOrgs.length})</option>
                {userOrgs.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="text-xs text-slate-400 font-mono self-end sm:self-auto">
            Showing <strong className="text-cyan-400">{filteredEvents.length}</strong> of {myEvents.length} events
          </div>
        </div>

        {/* Event Lifecycle Catalogue */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-white text-base">Organized Events Pipeline</h2>
            </div>
            <Link
              to="/organizer/events"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Full Catalogue View →
            </Link>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-white">No events match the selected filter</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Change your filter criteria or click below to start drafting a new event proposal.
              </p>
              <Link
                to="/organizer/create"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl mt-5 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Draft New Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.08]">
              {filteredEvents.map(event => {
                const startDate = new Date(event.start_time);
                const isEditable = canManageEvent(event, currentUser?.id) && 
                  (currentUser?.role === 'admin' || ['draft', 'changes_requested', 'pending_review'].includes(event.status));

                // Check conflicts for this item
                const itemClashes = detectEventConflicts(
                  {
                    start_time: event.start_time,
                    end_time: event.end_time,
                    venue_id: event.venue_id,
                    category: event.category
                  },
                  events,
                  venues,
                  event.id
                ).conflicts;

                return (
                  <div key={event.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          event.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : event.status === 'pending_review'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : event.status === 'changes_requested'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : event.status === 'draft'
                            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                            : 'bg-[#050814]/80 text-slate-400 border-white/10'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>

                        {/* Organization */}
                        <span className="text-xs font-semibold text-indigo-400">
                          {event.organization?.name || 'Club'}
                        </span>

                        <span className="text-white/20">·</span>

                        {/* Category */}
                        <span className="text-xs text-cyan-300 font-medium">
                          {event.category}
                        </span>

                        {/* Privacy Pill for Drafts */}
                        {event.status === 'draft' && (
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-white/10">
                            Private to Club
                          </span>
                        )}

                        {/* Conflict Warning Indicator */}
                        {itemClashes.length > 0 && (
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {itemClashes.length} Conflict Warning{itemClashes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-base truncate">
                        <Link to={`/events/${event.id}`} className="hover:text-cyan-300 transition">
                          {event.title}
                        </Link>
                      </h3>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {startDate.toLocaleString('en-IN', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short',
                            timeZone: event.timezone || 'Asia/Kolkata' 
                          })}
                        </span>
                        <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Hall'}</strong></span>
                        <span>Registrations: <strong className="text-slate-300 font-mono">{event.views_count} views</strong></span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/[0.08]">
                      {/* Lifecycle Timeline Modal Toggle */}
                      <button
                        type="button"
                        onClick={() => setSelectedTimelineEvent(event)}
                        className="text-xs bg-[#050814]/80 hover:bg-[#0b1020] text-cyan-400 hover:text-white font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                        title="View Submission Timeline & History"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Timeline
                      </button>

                      {/* Public Preview */}
                      <Link
                        to={`/events/${event.id}`}
                        className="text-xs bg-[#050814]/80 hover:bg-[#0b1020] text-slate-300 hover:text-white font-semibold px-3.5 py-2 rounded-xl border border-white/10 transition flex items-center gap-1.5"
                        title="Preview Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>

                      {/* Edit Button */}
                      {isEditable ? (
                        <Link
                          to={`/organizer/edit/${event.id}`}
                          className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-cyan-300 border border-indigo-500/40 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                          title="Edit Event Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      ) : (
                        <span 
                          className="text-xs bg-slate-800/60 text-slate-500 px-3.5 py-2 rounded-xl border border-white/5 cursor-not-allowed flex items-center gap-1.5 font-mono"
                          title="Locked while live or without club edit rights"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Locked
                        </span>
                      )}

                      {/* Cancel Event */}
                      {event.status !== 'cancelled' && event.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel "${event.title}"? This cannot be undone.`)) {
                              cancelEvent(event.id);
                            }
                          }}
                          className="text-xs text-rose-400 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl font-semibold transition border border-transparent hover:border-rose-500/20 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lifecycle Status Timeline Dialog Modal */}
      {selectedTimelineEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 glow-indigo relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-5">
              <div>
                <span className="text-xs font-mono font-semibold text-indigo-400">
                  {selectedTimelineEvent.organization?.name || 'Club Organization'}
                </span>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {selectedTimelineEvent.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTimelineEvent(null)}
                className="text-xs bg-[#050814]/80 hover:bg-[#0b1020] text-slate-400 hover:text-white px-3.5 py-2 rounded-xl border border-white/10 transition cursor-pointer"
              >
                Close
              </button>
            </div>

            <StatusTimeline
              status={selectedTimelineEvent.status}
              createdAt={selectedTimelineEvent.created_at}
              updatedAt={selectedTimelineEvent.updated_at}
              approvalsHistory={approvals.filter(a => a.event_id === selectedTimelineEvent.id)}
              actionButtonLabel={selectedTimelineEvent.status === 'changes_requested' ? 'Open Event Editor' : undefined}
              onActionClick={() => {
                const targetId = selectedTimelineEvent.id;
                setSelectedTimelineEvent(null);
                window.location.href = `/organizer/edit/${targetId}`;
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
