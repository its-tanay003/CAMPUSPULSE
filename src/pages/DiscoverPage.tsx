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
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
                Discover Campus Events
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1">
                Real-time searchable event layer across verified clubs, departments, and authoritative campus venues.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">Active Filters:</span>
              <Badge variant={activeFilterCount > 0 ? 'secondary' : 'neutral'}>
                {activeFilterCount} Active
              </Badge>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#38BDF8] hover:text-cyan-300 font-semibold underline ml-1"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Search Input and Mobile Trigger */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by event title, description, organizing club, venue, or category..."
                aria-label="Search events"
                className="w-full pl-11 pr-10 py-3 bg-[#0B1020] border border-[#334155] rounded-xl text-sm text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3.5 top-3.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant="secondary"
              className="sm:hidden gap-2"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <Filter className="w-4 h-4 text-[#38BDF8]" />
              Filter Options ({activeFilterCount})
            </Button>
          </div>

          {/* Quick Date Shortcuts Bar */}
          <div className="mt-4 pt-4 border-t border-[#334155] flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[#94A3B8] font-semibold flex items-center gap-1.5 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#38BDF8]" />
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
                className={`px-3 py-1 rounded-lg font-semibold transition border ${
                  dateFilter === d.id
                    ? 'bg-[#7C5CFC] text-white border-[#7C5CFC] shadow-sm'
                    : 'bg-[#0B1020] text-[#94A3B8] hover:text-[#F8FAFC] border-[#334155]'
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
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-[#151C2F] p-6 rounded-2xl border border-[#334155] shadow-md h-fit`}>
            <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
              <h2 className="font-bold text-[#F8FAFC] text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#38BDF8]" />
                Filter Options
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#38BDF8] hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="filter-cat" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="filter-cat"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue Filter */}
            <div>
              <label htmlFor="filter-venue" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Campus Venue
              </label>
              <select
                id="filter-venue"
                value={selectedVenue}
                onChange={(e) => {
                  setSelectedVenue(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Campus Venues</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.building})</option>
                ))}
              </select>
            </div>

            {/* Organizer Filter */}
            <div>
              <label htmlFor="filter-org" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Organizing Club
              </label>
              <select
                id="filter-org"
                value={selectedOrg}
                onChange={(e) => {
                  setSelectedOrg(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Clubs & Societies</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Admission / Cost */}
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Admission Fee
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#0B1020] p-1 rounded-xl border border-[#334155] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setCostFilter('all'); setCurrentPage(1); }}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'all' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => { setCostFilter('free'); setCurrentPage(1); }}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'free' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => { setCostFilter('paid'); setCurrentPage(1); }}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'paid' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Registration Method */}
            <div>
              <label htmlFor="filter-reg" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Registration Status
              </label>
              <select
                id="filter-reg"
                value={regStatusFilter}
                onChange={(e) => {
                  setRegStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
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
            <div className="flex items-center justify-between bg-[#151C2F] px-5 py-3.5 rounded-2xl border border-[#334155] text-xs text-[#94A3B8] shadow-sm">
              <span className="font-semibold text-[#F8FAFC]">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="sort-events-select" className="text-[#94A3B8] font-medium">Sort:</label>
                  <select
                    id="sort-events-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort events"
                    className="bg-transparent font-bold text-[#38BDF8] border-none focus:outline-none cursor-pointer"
                  >
                    <option value="soonest" className="bg-[#151C2F] text-[#F8FAFC]">Chronological (Soonest)</option>
                    <option value="recent" className="bg-[#151C2F] text-[#F8FAFC]">Recently Added</option>
                    {currentUser?.interests && currentUser.interests.length > 0 && (
                      <option value="recommended" className="bg-[#151C2F] text-[#F8FAFC]">Recommended (My Interests)</option>
                    )}
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-1 border-l pl-3 border-[#334155]">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view layout"
                    className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#7C5CFC]/20 text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view layout"
                    className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-[#7C5CFC]/20 text-[#38BDF8]' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
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
                  <div className="flex items-center justify-between pt-6 border-t border-[#334155] text-xs">
                    <span className="text-[#94A3B8]">
                      Page {currentPage} of {totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className="gap-1"
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
