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
import type { EventStatus } from '../types';

export const OrganizerDashboardPage: React.FC = () => {
  const { events, venues, currentUser, cancelEvent, getUserOrganizations, canManageEvent } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>('all');

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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workspace Banner */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Authorized Organizer Workspace
              </span>
              <span className="text-xs text-[#94A3B8]">
                {currentUser?.full_name} ({currentUser?.role})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Event Publishing & Scheduling Studio
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
              Manage your club's event pipeline with strict database-level membership authorization, draft privacy, and pre-submission venue collision radar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/organizer/clashes"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-[#F8FAFC] border border-[#334155] font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Conflict Radar ({unresolvedConflictCount})
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

        {/* Real Metrics Grid - 5 Critical Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Drafts */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'draft' ? 'all' : 'draft')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              statusFilter === 'draft'
                ? 'bg-[#1E293B] border-[#7C5CFC] ring-2 ring-[#7C5CFC]/40'
                : 'bg-[#151C2F] border-[#334155] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#94A3B8]">Private Drafts</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-[#F8FAFC]">{draftCount}</div>
              <div className="text-[10px] text-[#94A3B8]">Only visible to your club</div>
            </div>
          </button>

          {/* Pending Review */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'pending_review' ? 'all' : 'pending_review')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              statusFilter === 'pending_review'
                ? 'bg-[#1E293B] border-amber-500 ring-2 ring-amber-500/40'
                : 'bg-[#151C2F] border-[#334155] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300">{pendingCount}</div>
              <div className="text-[10px] text-[#94A3B8]">Awaiting Admin DSW check</div>
            </div>
          </button>

          {/* Published */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'published' ? 'all' : 'published')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              statusFilter === 'published'
                ? 'bg-[#1E293B] border-emerald-500 ring-2 ring-emerald-500/40'
                : 'bg-[#151C2F] border-[#334155] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">Published Live</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-300">{publishedCount}</div>
              <div className="text-[10px] text-[#94A3B8]">Discoverable to campus</div>
            </div>
          </button>

          {/* Requires Changes */}
          <button 
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'changes_requested' ? 'all' : 'changes_requested')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
              statusFilter === 'changes_requested'
                ? 'bg-[#1E293B] border-rose-500 ring-2 ring-rose-500/40'
                : 'bg-[#151C2F] border-[#334155] hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400">Needs Changes</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-rose-300">{changesRequestedCount}</div>
              <div className="text-[10px] text-[#94A3B8]">Admin feedback attached</div>
            </div>
          </button>

          {/* Conflict Warnings */}
          <div className="p-4 rounded-2xl border bg-[#151C2F] border-[#334155] col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#38BDF8]">Conflict Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300">{unresolvedConflictCount}</div>
              <div className="text-[10px] text-[#94A3B8]">Timing/venue overlap warnings</div>
            </div>
          </div>
        </div>

        {/* Unresolved Conflict Alert Callout */}
        {unresolvedConflictCount > 0 && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-200 text-sm">
                  {unresolvedConflictCount} Active Event{unresolvedConflictCount > 1 ? 's Have' : ' Has'} Scheduling Overlaps
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Review potential venue double-bookings or concurrent category clashes before final admin approval.
                </p>
              </div>
            </div>
            <Link
              to="/organizer/clashes"
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold px-4 py-2 rounded-xl transition text-center shrink-0"
            >
              Open Conflict Radar →
            </Link>
          </div>
        )}

        {/* Controls Bar: Search & Filtering */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#38BDF8]" /> Filters:
            </span>
            
            <select
              aria-label="Filter events by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-[#0B1020] border border-[#334155] rounded-xl px-3 py-1.5 text-[#F8FAFC]"
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
                className="text-xs bg-[#0B1020] border border-[#334155] rounded-xl px-3 py-1.5 text-[#F8FAFC]"
              >
                <option value="all">All My Clubs ({userOrgs.length})</option>
                {userOrgs.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="text-xs text-[#94A3B8] font-medium self-end sm:self-auto">
            Showing <strong className="text-[#F8FAFC]">{filteredEvents.length}</strong> of {myEvents.length} events
          </div>
        </div>

        {/* Event Lifecycle Catalogue */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-5 border-b border-[#334155] flex items-center justify-between bg-[#151C2F]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#7C5CFC]" />
              <h2 className="font-bold text-[#F8FAFC] text-sm">Organized Events Pipeline</h2>
            </div>
            <Link
              to="/organizer/events"
              className="text-xs text-[#38BDF8] hover:underline font-semibold"
            >
              Full Catalogue View →
            </Link>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-[#94A3B8]/40 mx-auto mb-3" />
              <h3 className="font-bold text-base text-[#F8FAFC]">No events match the selected filter</h3>
              <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
                Change your filter criteria or click below to start drafting a new event proposal.
              </p>
              <Link
                to="/organizer/create"
                className="inline-flex items-center gap-1.5 bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-4 py-2 rounded-xl mt-4 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Draft New Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#334155]">
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
                  <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E293B]/40 transition">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          event.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : event.status === 'pending_review'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : event.status === 'changes_requested'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : event.status === 'draft'
                            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                            : 'bg-[#0B1020] text-[#94A3B8] border-[#334155]'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>

                        {/* Organization */}
                        <span className="text-xs font-semibold text-[#7C5CFC]">
                          {event.organization?.name || 'Club'}
                        </span>

                        <span className="text-[#334155]">·</span>

                        {/* Category */}
                        <span className="text-xs text-[#38BDF8] font-medium">
                          {event.category}
                        </span>

                        {/* Privacy Pill for Drafts */}
                        {event.status === 'draft' && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-[#334155]">
                            Private to Club
                          </span>
                        )}

                        {/* Conflict Warning Indicator */}
                        {itemClashes.length > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {itemClashes.length} Conflict Warning{itemClashes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-[#F8FAFC] text-base truncate">
                        <Link to={`/events/${event.id}`} className="hover:text-[#38BDF8] transition">
                          {event.title}
                        </Link>
                      </h3>

                      <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {startDate.toLocaleString('en-IN', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short',
                            timeZone: event.timezone || 'Asia/Kolkata' 
                          })}
                        </span>
                        <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Hall'}</strong></span>
                        <span>Registrations: <strong className="text-slate-300">{event.views_count} views</strong></span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                      {/* Public Preview */}
                      <Link
                        to={`/events/${event.id}`}
                        className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition flex items-center gap-1"
                        title="Preview Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>

                      {/* Edit Button (Subject to authorization and lifecycle state) */}
                      {isEditable ? (
                        <Link
                          to={`/organizer/edit/${event.id}`}
                          className="text-xs bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 text-[#38BDF8] border border-[#7C5CFC]/40 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                          title="Edit Event Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      ) : (
                        <span 
                          className="text-xs bg-slate-800 text-slate-500 px-3 py-2 rounded-xl border border-slate-700 cursor-not-allowed flex items-center gap-1"
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
                          className="text-xs text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl font-semibold transition border border-transparent hover:border-rose-500/20"
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
    </div>
  );
};
