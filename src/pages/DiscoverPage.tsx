import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
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

export const DiscoverPage: React.FC = () => {
  const { events, venues, organizations, searchQuery, setSearchQuery } = useApp();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'soonest' | 'recent'>('soonest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active Filter Count
  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    (selectedVenue !== 'all' ? 1 : 0) +
    (selectedOrg !== 'all' ? 1 : 0) +
    (costFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() !== '' ? 1 : 0);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedVenue('all');
    setSelectedOrg('all');
    setCostFilter('all');
    setSearchQuery('');
  };

  // Filter and Sort Logic
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (e.status !== 'published') return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(query);
        const matchesDesc = e.description.toLowerCase().includes(query);
        const matchesOrg = e.organization?.name.toLowerCase().includes(query);
        const matchesVenue = e.venue?.name.toLowerCase().includes(query);
        const matchesTag = e.tags.some(t => t.toLowerCase().includes(query));

        if (!matchesTitle && !matchesDesc && !matchesOrg && !matchesVenue && !matchesTag) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      if (selectedVenue !== 'all' && e.venue_id !== selectedVenue) {
        return false;
      }

      if (selectedOrg !== 'all' && e.organization_id !== selectedOrg) {
        return false;
      }

      if (costFilter === 'free' && e.cost !== 'Free') return false;
      if (costFilter === 'paid' && e.cost === 'Free') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'soonest') {
        return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [events, searchQuery, selectedCategory, selectedVenue, selectedOrg, costFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B1020] text-[#F8FAFC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Global Search Bar */}
        <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-6 shadow-md mb-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              Discover Campus Events
            </h1>
            <p className="text-sm text-[#94A3B8] mt-1">
              Search by title, club organizer, venue or topic. Transparent filtering with zero noise.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, clubs, venues, or topics..."
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

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden flex items-center justify-center gap-2 bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] font-semibold px-4 py-3 rounded-xl text-sm border border-[#334155]"
            >
              <Filter className="w-4 h-4 text-[#38BDF8]" />
              Filters ({activeFilterCount})
            </button>
          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-[#151C2F] p-6 rounded-2xl border border-[#334155] shadow-md h-fit`}>
            <div className="flex items-center justify-between pb-4 border-b border-[#334155]">
              <h2 className="font-bold text-[#F8FAFC] text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#38BDF8]" />
                Filter Catalogue
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

            {/* Category filter */}
            <div>
              <label htmlFor="category-select" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue filter */}
            <div>
              <label htmlFor="venue-select" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Campus Venue
              </label>
              <select
                id="venue-select"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Campus Venues</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.building})</option>
                ))}
              </select>
            </div>

            {/* Organiser filter */}
            <div>
              <label htmlFor="organizer-select" className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Organizing Club / Dept
              </label>
              <select
                id="organizer-select"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#0B1020] text-[#F8FAFC] border border-[#334155] rounded-xl focus:ring-2 focus:ring-[#7C5CFC]"
              >
                <option value="all">All Student Organizations</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Cost filter */}
            <div>
              <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                Admission / Cost
              </label>
              <div className="grid grid-cols-3 gap-1 bg-[#0B1020] p-1 rounded-xl border border-[#334155] text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCostFilter('all')}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'all' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setCostFilter('free')}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'free' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setCostFilter('paid')}
                  className={`py-1.5 rounded-lg transition ${costFilter === 'paid' ? 'bg-[#7C5CFC] text-white shadow-sm' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
                >
                  Paid
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results bar & View Controls */}
            <div className="flex items-center justify-between bg-[#151C2F] px-5 py-3.5 rounded-xl border border-[#334155] text-xs text-[#94A3B8]">
              <span className="font-semibold text-[#F8FAFC]">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="sort-events-select" className="text-[#94A3B8] font-medium">Sort:</label>
                  <select
                    id="sort-events-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'soonest' | 'recent')}
                    aria-label="Sort events"
                    className="bg-transparent font-bold text-[#38BDF8] border-none focus:outline-none cursor-pointer"
                  >
                    <option value="soonest" className="bg-[#151C2F] text-[#F8FAFC]">Chronological (Soonest)</option>
                    <option value="recent" className="bg-[#151C2F] text-[#F8FAFC]">Recently Posted</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-1 border-l pl-3 border-[#334155]">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid layout"
                    className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-[#7C5CFC]/20 text-[#38BDF8]' : 'text-[#94A3B8]'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List layout"
                    className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-[#7C5CFC]/20 text-[#38BDF8]' : 'text-[#94A3B8]'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Event List/Grid or Empty State */}
            {filteredEvents.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="bg-[#151C2F] rounded-2xl border border-[#334155] p-12 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0B1020] border border-[#334155] flex items-center justify-center text-[#94A3B8] mb-4">
                  <Search className="w-8 h-8 text-[#38BDF8]" />
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC]">No events match these filters</h3>
                <p className="text-sm text-[#94A3B8] max-w-md mx-auto mt-2 leading-relaxed">
                  We couldn't find any approved events matching your selected criteria. Try broadening the date range, resetting categories, or searching for general keywords.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="bg-[#7C5CFC] hover:bg-[#6B46E5] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
