import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Grid, 
  List, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventCard } from '../components/EventCard';
import { EventCategory } from '../types';

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
      // only show published events in public discovery
      if (e.status !== 'published') return false;

      // search query match
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

      // category match
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false;
      }

      // venue match
      if (selectedVenue !== 'all' && e.venue_id !== selectedVenue) {
        return false;
      }

      // org match
      if (selectedOrg !== 'all' && e.organization_id !== selectedOrg) {
        return false;
      }

      // cost match
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Global Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Discover Campus Events
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Search by title, club organizer, venue or topic. Transparent filtering with zero noise.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, clubs, venues, or topics..."
                aria-label="Search events"
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="sm:hidden flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-3 rounded-xl text-sm"
            >
              <Filter className="w-4 h-4" />
              Filters ({activeFilterCount})
            </button>
          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-amber-500" />
                Filter Catalogue
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Category filter */}
            <div>
              <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue filter */}
            <div>
              <label htmlFor="venue-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Campus Venue
              </label>
              <select
                id="venue-select"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Campus Venues</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.building})</option>
                ))}
              </select>
            </div>

            {/* Organiser filter */}
            <div>
              <label htmlFor="organizer-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Organizing Club / Dept
              </label>
              <select
                id="organizer-select"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Student Organizations</option>
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Cost filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admission / Cost
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCostFilter('all')}
                  className={`py-1.5 rounded ${costFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setCostFilter('free')}
                  className={`py-1.5 rounded ${costFilter === 'free' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setCostFilter('paid')}
                  className={`py-1.5 rounded ${costFilter === 'paid' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600'}`}
                >
                  Paid
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results bar & View Controls */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </span>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="sort-events-select" className="text-slate-500 font-medium">Sort by:</label>
                  <select
                    id="sort-events-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'soonest' | 'recent')}
                    aria-label="Sort events"
                    className="bg-transparent font-semibold text-slate-800 border-none focus:outline-none cursor-pointer"
                  >
                    <option value="soonest">Chronological (Soonest)</option>
                    <option value="recent">Recently Posted</option>
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-1 border-l pl-3 border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid layout"
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-slate-100 text-amber-600' : 'text-slate-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List layout"
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-100 text-amber-600' : 'text-slate-400'}`}
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
              /* Accessible Empty State as specified in Blueprint Table 23 */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No events match these filters</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  We couldn't find any approved events matching your selected criteria. Try broadening the date range, resetting categories, or searching for general keywords.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="bg-[#0B192C] text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => {
                      resetFilters();
                      setSelectedCategory('Technology');
                    }}
                    className="bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-slate-200 transition"
                  >
                    View Technology Events
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

