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
      <div className="min-h-screen text-slate-100 py-16 px-4 text-center">
        <div className="max-w-md mx-auto glass-card rounded-3xl p-8 glow-indigo">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Only verified administrators may access the master campus events governance directory.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/home"
              className="bg-white hover:bg-white text-xs font-semibold px-4 py-2.5 rounded-2xl border border-slate-200 transition"
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
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-600 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Administrator Dashboard
          </Link>

          <Link
            to="/admin/approvals"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center gap-2 shadow"
          >
            <Clock className="w-3.5 h-3.5" />
            Open Approvals Queue
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-indigo">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Governance Layer</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                Master Campus Events Governance Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Complete institutional oversight: search, filter, inspect status, and audit all university listings.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Keyword Search */}
          <div>
            <label htmlFor="admin-search-input" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Search Events
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                id="admin-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Title, club, venue..."
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="admin-status-select" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Status Filter
            </label>
            <select
              id="admin-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
            <label htmlFor="admin-org-select" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Organization
            </label>
            <select
              id="admin-org-select"
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Organizations ({organizations.length})</option>
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Venue Filter */}
          <div>
            <label htmlFor="admin-venue-select" className="block text-xs font-mono font-semibold text-slate-400 mb-2">
              Authoritative Venue
            </label>
            <select
              id="admin-venue-select"
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
              className="w-full bg-white hover:bg-white text-slate-300 hover:text-indigo-600 text-xs font-semibold py-2.5 rounded-2xl border border-slate-200 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Event List Table */}
        <div className="glass-card rounded-3xl overflow-hidden glow-indigo">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              Matching Records: <span className="font-mono text-indigo-600">{filteredEvents.length}</span>
            </span>
            <span className="font-mono">Total Campus Registry: {events.length}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              No events matched the selected filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.08]">
              {filteredEvents.map(event => (
                <div key={event.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        event.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
                          : event.status === 'pending_review'
                          ? 'bg-amber-500/20 text-amber-800 border-amber-500/30'
                          : event.status === 'changes_requested'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                          : event.status === 'rejected'
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

                      {/* Public Visibility Indicator */}
                      {event.status === 'published' ? (
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                          Public Live Feed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-200 px-2.5 py-0.5 rounded-full font-semibold">
                          Hidden from Public
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base truncate">
                      {event.title}
                    </h3>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(event.start_time).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </span>
                      <span>Venue: <strong className="text-slate-300">{event.venue?.name || 'Assigned Hall'}</strong></span>
                      <span>Admission: <strong className="text-slate-300">{event.cost}</strong></span>
                      <span>Capacity: <strong className="text-slate-300 font-mono">{event.capacity || 'Open'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-xs bg-white hover:bg-white text-slate-300 hover:text-indigo-600 font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>

                    {event.status === 'pending_review' && (
                      <Link
                        to="/admin/approvals"
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
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

