import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Calendar, MapPin, Users } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import PublicLayout from '../../components/common/PublicLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useEventStore } from '../../store/useEventStore';
import { useAuthStore } from '../../store/useAuthStore';
import '../../css/users/EventsPage.css';

const EventsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { 
    events, 
    loading, 
    fetchEvents,
    filters,
    pagination
  } = useEventStore();

  const totalPages = pagination.totalPages || 1;

  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: 'approved',
    sort: searchParams.get('sort') || 'date',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(localFilters.search);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'career', label: 'Career' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'other', label: 'Other' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Soonest)' },
    { value: '-date', label: 'Date (Latest)' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: '-title', label: 'Title (Z-A)' },
    { value: 'capacity', label: 'Capacity' },
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== localFilters.search) {
        setLocalFilters(prev => ({ ...prev, search: searchInput }));
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Initialize page from URL on mount
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page') || '1');
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = {
      ...localFilters,
      page: currentPage,
      limit: 12,
      upcoming: true, // Only show upcoming events by default
    };
    fetchEvents(params);

    // Update URL params
    const newParams = new URLSearchParams();
    if (localFilters.search) newParams.set('search', localFilters.search);
    if (localFilters.category) newParams.set('category', localFilters.category);
    if (localFilters.sort !== 'date') newParams.set('sort', localFilters.sort);
    if (currentPage > 1) newParams.set('page', currentPage.toString());
    setSearchParams(newParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters, currentPage]);

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setLocalFilters({
      search: '',
      category: '',
      status: 'approved',
      sort: 'date',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = localFilters.search || localFilters.category || localFilters.sort !== 'date';

  const handleEventUpdate = () => {
    // Refresh events after RSVP
    const params = {
      ...localFilters,
      page: currentPage,
      limit: 12,
      upcoming: true,
    };
    fetchEvents(params);
  };

  const Layout = isAuthenticated ? DashboardLayout : PublicLayout;

  return (
    <Layout title={isAuthenticated ? "Browse Events" : undefined}>
      <div className="events-page">
        {/* Search and Filter Bar */}
        <div className="events-header">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput('');
                  handleFilterChange('search', '');
                }}
                className="clear-search-btn"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={localFilters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={localFilters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="results-header">
          <p className="results-count">
            {loading ? 'Loading...' : `${pagination.total || events.length} event${(pagination.total || events.length) !== 1 ? 's' : ''} found`}
            {totalPages > 1 && ` • Page ${pagination.currentPage || currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : events.length > 0 ? (
          <div className="events-grid">
            {events.map((event) => (
              <EventCard 
                key={event._id} 
                event={event} 
                showStatus={false}
                onEventUpdate={handleEventUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Calendar size={64} color="#9ca3af" />
            <h3>No events found</h3>
            <p>Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Create Event CTA for authenticated users */}
        {isAuthenticated && (
          <div className="create-event-cta">
            <div className="cta-content">
              <h3>Want to organize an event?</h3>
              <p>Create and manage your own events on campus</p>
              <button
                onClick={() => navigate('/events/create')}
                className="btn-primary large"
              >
                Create Event
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => {
                const newPage = Math.max(1, (pagination.currentPage || currentPage) - 1);
                setCurrentPage(newPage);
              }}
              disabled={(pagination.currentPage || currentPage) === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const current = pagination.currentPage || currentPage;
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (current <= 3) {
                  pageNum = i + 1;
                } else if (current >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = current - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-btn ${current === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const newPage = Math.min(totalPages, (pagination.currentPage || currentPage) + 1);
                setCurrentPage(newPage);
              }}
              disabled={(pagination.currentPage || currentPage) === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;

