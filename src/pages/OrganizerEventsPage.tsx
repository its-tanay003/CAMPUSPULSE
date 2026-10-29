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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/organizer"
            className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Organizer Workspace
          </Link>

          <Link
            to="/organizer/create"
            className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            New Event Proposal
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 text-[#38BDF8] border border-[#7C5CFC]/30 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
                All Managed Club Events
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Full lifecycle directory of drafts, reviews, approvals, and published campus listings.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search-org-events" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Search by Keyword
            </label>
            <input
              id="search-org-events"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, venue, category..."
              className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-1 focus:ring-[#7C5CFC]"
            />
          </div>

          <div>
            <label htmlFor="filter-org-status" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Status Filter
            </label>
            <select
              id="filter-org-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
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
            <label htmlFor="filter-org-club" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Host Club / Society
            </label>
            <select
              id="filter-org-club"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
            >
              <option value="all">All Clubs ({userOrgs.length})</option>
              {userOrgs.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Listing */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-4 border-b border-[#334155] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5 font-semibold text-[#F8FAFC]">
              <Filter className="w-3.5 h-3.5 text-[#38BDF8]" />
              Event Results: {filteredEvents.length}
            </span>
            <span>Total Organized: {myEvents.length}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-[#F8FAFC]">No events match your search</p>
              <p className="text-xs text-[#94A3B8] mt-1">Try resetting filters or searching a different term.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#334155]">
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
                  <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E293B]/40 transition">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
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

                        <span className="text-xs font-semibold text-[#7C5CFC]">
                          {event.organization?.name || 'Club'}
                        </span>

                        <span className="text-[#334155]">·</span>

                        <span className="text-xs text-[#38BDF8] font-medium">
                          {event.category}
                        </span>

                        {event.status === 'draft' && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-[#334155]">
                            Private Draft
                          </span>
                        )}

                        {clashes.length > 0 && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" />
                            {clashes.length} Warning{clashes.length > 1 ? 's' : ''}
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
                        <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Room'}</strong></span>
                        <span>Audience: <strong className="text-slate-300">{event.target_audience}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                      <Link
                        to={`/events/${event.id}`}
                        className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </Link>

                      {isEditable && (
                        <Link
                          to={`/organizer/edit/${event.id}`}
                          className="text-xs bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 text-[#38BDF8] border border-[#7C5CFC]/40 font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
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
                          className="text-xs text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl font-semibold transition"
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

