import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  RotateCcw,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { Button, Input, Select, Badge, Card, EmptyState, LoadingIndicator, ErrorState } from '../components/ui';
import type { EventCategory } from '../types';

const CATEGORIES: EventCategory[] = [
  'Technology',
  'Cultural',
  'Sports',
  'Workshops',
  'Research',
  'Music',
  'Photography',
  'Volunteering',
  'Academic'
];

type QuickDateFilter = 'all' | 'today' | 'this_week' | 'next_7_days';

const ITEMS_PER_PAGE = 6;

export const DiscoverPage: React.FC = () => {
  const { events, venues, organizations, searchQuery, setSearchQuery, isLoading, currentUser } = useApp();

  // Multi-dimensional Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [dateFilter, setDateFilter] = useState<QuickDateFilter>('all');
  const [regStatusFilter, setRegStatusFilter] = useState<'all' | 'open' | 'none_needed' | 'external'>('all');
  const [sortBy, setSortBy] = useState<'soonest' | 'recent' | 'recommended'>('soonest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Active Filter Count
  const activeFilterCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedVenue !== 'all' ? 1 : 0) +
    (selectedOrg !== 'all' ? 1 : 0) +
    (costFilter !== 'all' ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (regStatusFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedVenue('all');
    setSelectedOrg('all');
    setCostFilter('all');
    setDateFilter('all');
    setRegStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Filter and Sort Engine (enforcing database public read policy: published only)
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;
    const sevenDaysFromNow = todayStart + 7 * 24 * 60 * 60 * 1000;

    return events.filter(e => {
      // Security Policy: Only published events visible in public discovery
      if (e.status !== 'published') return false;

      // 1. Full-text search across Title, Description, Organizer, Category, Venue
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesOrg = e.organization?.name.toLowerCase().includes(query);
        const matchesVenue = e.venue?.name.toLowerCase().includes(query);
        const matchesCat = e.category.toLowerCase().includes(query);
        const matchesTag = e.tags?.some(t => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesVenue && !matchesCat && !matchesTag) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // 3. Venue Filter
      if (selectedVenue !== 'all' && e.venue_id !== selectedVenue) {
        return false;
      }

      // 4. Organizer Filter
      if (selectedOrg !== 'all' && e.organization_id !== selectedOrg) {
        return false;
      }

      // 5. Cost Filter
      if (costFilter === 'free' && e.cost !== 'Free') return false;
      if (costFilter === 'paid' && e.cost === 'Free') return false;

      // 6. Registration Status Filter
      if (regStatusFilter === 'open' && e.registration_method !== 'internal') return false;
      if (regStatusFilter === 'external' && e.registration_method !== 'external') return false;
      if (regStatusFilter === 'none_needed' && e.registration_method !== 'none') return false;

      // 7. Date Range Filter
      const eventTime = new Date(e.start_time).getTime();
      if (dateFilter === 'today') {
        if (eventTime < todayStart || eventTime >= todayEnd) return false;
      } else if (dateFilter === 'this_week' || dateFilter === 'next_7_days') {
        if (eventTime < todayStart || eventTime > sevenDaysFromNow) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'soonest') {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      } else if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'recommended') {
        // Transparent recommendation based on active student interests
        const userInterests = currentUser?.interests || [];
        const aMatches = userInterests.includes(a.category) ? 1 : 0;
        const bMatches = userInterests.includes(b.category) ? 1 : 0;
        if (aMatches !== bMatches) return bMatches - aMatches;
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      }
      return 0;
    });
  }, [events, searchQuery, selectedCategory, selectedVenue, selectedOrg, costFilter, dateFilter, regStatusFilter, sortBy, currentUser]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE) || 1;
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen text-slate-100 py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 glow-indigo">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">Event Exploration Layer</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                Discover Campus Events
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Real-time searchable event catalogue across verified student clubs, academic departments, and authoritative campus venues.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-slate-400">Active Filters:</span>
              <Badge variant={activeFilterCount > 0 ? 'primary' : 'neutral'}>
                {activeFilterCount} Active
              </Badge>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Search Input and Mobile Trigger */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by event title, description, organizing club, venue, or category..."
                aria-label="Search events"
                className="w-full pl-12 pr-11 py-3.5 bg-[#050814]/80 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white rounded-full p-0.5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              className="sm:hidden gap-2"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              aria-expanded={mobileFilterOpen}
              aria-controls="discover-filter-sidebar"
            >
              <Filter className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              Filter Options ({activeFilterCount})
            </Button>
          </div>

          {/* Quick Date Shortcuts Bar */}
          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              Quick Date:
            </span>
            {[
              { id: 'all', label: 'Any Date' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'next_7_days', label: 'Next 7 Days' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDateFilter(d.id as QuickDateFilter);
                  setCurrentPage(1);
                }}
                aria-pressed={dateFilter === d.id}
                className={`px-3.5 py-1.5 min-h-[36px] rounded-xl font-medium transition-all border ${
                  dateFilter === d.id
                    ? 'bg-indigo-600 text-white border-indigo-400/40 shadow-md shadow-indigo-600/30'
                    : 'bg-[#050814]/70 text-slate-400 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Filters Sidebar (Col 1) + Results Canvas (Col 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <aside 
            id="discover-filter-sidebar"
            aria-label="Event filters"
            className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 glass-card p-6 rounded-3xl glow-indigo h-fit`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                Filter Options
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 p-1 min-h-[32px] transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="filter-cat" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="filter-cat"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-3 bg-[#050814]/80 text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue Filter */}
            <div>
              <label htmlFor="filter-venue" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Campus Venue
              </label>
              <select
                id="filter-venue"
                value={selectedVenue}
                onChange={(e) => {
                  setSelectedVenue(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-3 bg-[#050814]/80 text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all cursor-pointer"
              >
                <option value="all">All Campus Venues</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.building})</option>
                ))}
              </select>
            </div>

            {/* Organizer Filter */}
            <div>
              <label htmlFor="filter-org" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Organizing Club
              </label>
              <select
                id="filter-org"
                value={selectedOrg}
                onChange={(e) => {
                  setSelectedOrg(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-3 bg-[#050814]/80 text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all cursor-pointer"
              >
                <option value="all">All Clubs & Societies</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Admission / Cost */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Admission Fee
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#050814]/80 p-1.5 rounded-2xl border border-white/10 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setCostFilter('all'); setCurrentPage(1); }}
                  aria-pressed={costFilter === 'all'}
                  className={`py-2 min-h-[36px] rounded-xl transition cursor-pointer ${costFilter === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => { setCostFilter('free'); setCurrentPage(1); }}
                  aria-pressed={costFilter === 'free'}
                  className={`py-2 min-h-[36px] rounded-xl transition cursor-pointer ${costFilter === 'free' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => { setCostFilter('paid'); setCurrentPage(1); }}
                  aria-pressed={costFilter === 'paid'}
                  className={`py-2 min-h-[36px] rounded-xl transition cursor-pointer ${costFilter === 'paid' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-slate-400 hover:text-white'}`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Registration Method */}
            <div>
              <label htmlFor="filter-reg" className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Registration Status
              </label>
              <select
                id="filter-reg"
                value={regStatusFilter}
                onChange={(e) => {
                  setRegStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-3 bg-[#050814]/80 text-white border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 transition-all cursor-pointer"
              >
                <option value="all">Any Registration Type</option>
                <option value="open">CampusPulse 1-Click Open</option>
                <option value="external">External Form / Portal</option>
                <option value="none_needed">Open Walk-in (No signup needed)</option>
              </select>
            </div>
          </aside>

          {/* Results Canvas */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* View Bar: Count, Sort Dropdown & Grid Toggle */}
            <div className="flex items-center justify-between glass-card px-6 py-4 rounded-3xl text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Showing <span className="font-mono text-cyan-300">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-events-select" className="text-slate-400 font-medium">Sort:</label>
                  <select
                    id="sort-events-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort events"
                    className="bg-[#050814]/80 font-bold text-cyan-400 border border-white/10 px-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="soonest" className="bg-[#0b1020] text-white">Chronological (Soonest)</option>
                    <option value="recent" className="bg-[#0b1020] text-white">Recently Added</option>
                    {currentUser?.interests && currentUser.interests.length > 0 && (
                      <option value="recommended" className="bg-[#0b1020] text-white">Recommended (My Interests)</option>
                    )}
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 border-l pl-3.5 border-white/[0.08]">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view layout"
                    className={`p-2 rounded-xl transition cursor-pointer ${viewMode === 'grid' ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view layout"
                    className={`p-2 rounded-xl transition cursor-pointer ${viewMode === 'list' ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid / List */}
            {isLoading ? (
              <LoadingIndicator label="Querying event records..." />
            ) : filteredEvents.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                  {paginatedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.08] text-xs">
                    <span className="text-slate-400 font-mono">
                      Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="gap-1.5 rounded-xl"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="gap-1.5 rounded-xl"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No events match your criteria"
                description="We couldn't find any approved campus events matching your active filters. Try expanding the date range, clearing specific clubs, or resetting all filters."
                actionLabel="Clear All Filters"
                onAction={resetFilters}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
