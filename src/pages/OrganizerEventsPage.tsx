import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Calendar, 
  PlusCircle, 
  Layers, 
  Filter, 
  Eye, 
  Edit3, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { detectEventConflicts } from '../lib/clashDetector';
import type { EventStatus } from '../types';

export const OrganizerEventsPage: React.FC = () => {
  const { events, venues, currentUser, cancelEvent, getUserOrganizations, canManageEvent } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [orgFilter, setOrgFilter] = useState('all');

  const userOrgs = getUserOrganizations(currentUser?.id);
  const userOrgIds = userOrgs.map(o => o.id);

  // Filter events belonging to clubs where the user is an active member or creator (or all for admin)
  const myEvents = events.filter(e => {
    if (currentUser?.role === 'admin') return true;
    return userOrgIds.includes(e.organization_id) || e.created_by === currentUser?.id;
  });

  const filteredEvents = myEvents.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (orgFilter !== 'all' && e.organization_id !== orgFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchVenue = e.venue?.name?.toLowerCase().includes(q);
      const matchCat = e.category.toLowerCase().includes(q);
      if (!matchTitle && !matchVenue && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/organizer"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-600 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Organizer Workspace
          </Link>

          <Link
            to="/organizer/create"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Event Proposal
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Club Management</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                All Managed Club Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Full lifecycle directory of drafts, reviews, approvals, and published campus listings.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-org-events" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Search by Keyword
            </label>
            <input
              id="search-org-events"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, venue, category..."
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="filter-org-status" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Status Filter
            </label>
            <select
              id="filter-org-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses ({myEvents.length})</option>
              <option value="draft">Drafts Only</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="filter-org-club" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Host Club / Society
            </label>
            <select
              id="filter-org-club"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Clubs ({userOrgs.length})</option>
              {userOrgs.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listing */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-semibold text-white">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Event Results: <span className="font-mono text-indigo-600">{filteredEvents.length}</span>
            </span>
            <span className="font-mono">Total Organized: {myEvents.length}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-base font-bold text-white">No events match your search</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching a different term.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.08]">
              {filteredEvents.map(event => {
                const startDate = new Date(event.start_time);
                const isEditable = canManageEvent(event, currentUser?.id) && 
                  (currentUser?.role === 'admin' || ['draft', 'changes_requested', 'pending_review'].includes(event.status));

                const clashes = detectEventConflicts(
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
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          event.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                            : event.status === 'pending_review'
                            ? 'bg-amber-500/20 text-amber-800 border-amber-500/30'
                            : event.status === 'changes_requested'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : event.status === 'draft'
                            ? 'bg-slate-700/50 text-slate-300 border-slate-600'
                            : 'bg-white text-slate-400 border-slate-200'
                        }`}>
                          {event.status.replace('_', ' ')}
                        </span>

                        <span className="text-xs font-semibold text-indigo-400">
                          {event.organization?.name || 'Club'}
                        </span>

                        <span className="text-white/20">·</span>

                        <span className="text-xs text-indigo-600 font-medium">
                          {event.category}
                        </span>

                        {event.status === 'draft' && (
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Private Draft
                          </span>
                        )}

                        {clashes.length > 0 && (
                          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-700 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {clashes.length} Warning{clashes.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-white text-base truncate">
                        <Link to={`/events/${event.id}`} className="hover:text-indigo-600 transition">
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
                        <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Room'}</strong></span>
                        <span>Audience: <strong className="text-slate-300">{event.target_audience}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                      <Link
                        to={`/events/${event.id}`}
                        className="text-xs bg-white hover:bg-white text-slate-300 hover:text-indigo-600 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>

                      {isEditable && (
                        <Link
                          to={`/organizer/edit/${event.id}`}
                          className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-600 border border-indigo-500/40 font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                      )}

                      {event.status !== 'cancelled' && event.status !== 'completed' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel "${event.title}"?`)) {
                              cancelEvent(event.id);
                            }
                          }}
                          className="text-xs text-rose-400 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl font-semibold transition cursor-pointer"
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
  );};
