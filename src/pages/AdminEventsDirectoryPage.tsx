import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  Layers, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { EventStatus, EventCategory } from '../types';

export const AdminEventsDirectoryPage: React.FC = () => {
  const { events, venues, organizations, currentUser } = useApp();
  const [searchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') as EventStatus | 'all' || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [venueFilter, setVenueFilter] = useState<string>('all');
  const [orgFilter, setOrgFilter] = useState<string>('all');

  // Access Guardian
  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-[#151C2F] border border-rose-500/30 rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#F8FAFC]">Administrative Access Restricted</h2>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            Only verified administrators may access the master campus events governance directory.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="bg-[#0B1020] hover:bg-[#1E293B] text-xs font-semibold px-4 py-2 rounded-xl border border-[#334155] transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Multi-field search and filter
  const filteredEvents = events.filter(e => {
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
    if (venueFilter !== 'all' && e.venue_id !== venueFilter) return false;
    if (orgFilter !== 'all' && e.organization_id !== orgFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchOrg = e.organization?.name?.toLowerCase().includes(q);
      const matchVenue = e.venue?.name?.toLowerCase().includes(q);
      const matchDesc = e.description.toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchVenue && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Administrator Dashboard
          </Link>

          <Link
            to="/admin/approvals"
            className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <Clock className="w-3.5 h-3.5" />
            Open Approvals Queue
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#F8FAFC] tracking-tight">
                Master Campus Events Governance Directory
              </h1>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Complete institutional oversight: search, filter, inspect status, and audit all university listings.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div>
            <label htmlFor="admin-search-input" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Search Events
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                id="admin-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Title, club, venue..."
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC] focus:ring-1 focus:ring-[#7C5CFC]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="admin-status-select" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Status Filter
            </label>
            <select
              id="admin-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs p-2 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
            >
              <option value="all">All Statuses ({events.length})</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="draft">Drafts</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Organization Filter */}
          <div>
            <label htmlFor="admin-org-select" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Organization
            </label>
            <select
              id="admin-org-select"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full text-xs p-2 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
            >
              <option value="all">All Organizations ({organizations.length})</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Venue Filter */}
          <div>
            <label htmlFor="admin-venue-select" className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
              Authoritative Venue
            </label>
            <select
              id="admin-venue-select"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full text-xs p-2 bg-[#0B1020] border border-[#334155] rounded-xl text-[#F8FAFC]"
            >
              <option value="all">All Venues ({venues.length})</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Reset */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setVenueFilter('all');
                setOrgFilter('all');
              }}
              className="w-full bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold py-2 rounded-xl border border-[#334155] transition"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Event List Table */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] overflow-hidden shadow-md">
          <div className="p-4 border-b border-[#334155] flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="font-semibold text-[#F8FAFC] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#38BDF8]" />
              Matching Records: {filteredEvents.length}
            </span>
            <span>Total Campus Registry: {events.length}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#94A3B8]">
              <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              No events matched the selected filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-[#334155]">
              {filteredEvents.map(event => (
                <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1E293B]/40 transition">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        event.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : event.status === 'pending_review'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : event.status === 'changes_requested'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : event.status === 'rejected'
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

                      {/* Public Visibility Indicator */}
                      {event.status === 'published' ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                          Public Live Feed
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-semibold">
                          Hidden from Public
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-[#F8FAFC] text-base truncate">
                      {event.title}
                    </h3>

                    <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(event.start_time).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                      <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Hall'}</strong></span>
                      <span>Admission: <strong className="text-slate-300">{event.cost}</strong></span>
                      <span>Capacity: <strong className="text-slate-300">{event.capacity || 'Open'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#334155]">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-[#0B1020] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-semibold px-3 py-2 rounded-xl border border-[#334155] transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {event.status === 'pending_review' && (
                      <Link
                        to="/admin/approvals"
                        className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shadow"
                      >
                        Clearance Review →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

