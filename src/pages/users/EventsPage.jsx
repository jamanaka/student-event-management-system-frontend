import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, Calendar, MapPin, Grid3x3, List, Sparkles, TrendingUp, Clock, SlidersHorizontal } from 'lucide-react';
import { FaMagic, FaBook, FaBirthdayCake, FaFutbol, FaTheaterMasks, FaBriefcase, FaTools, FaStar } from 'react-icons/fa';
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categories = [
    { value: '', label: 'All Categories', icon: FaMagic, color: '#6366f1' },
    { value: 'academic', label: 'Academic', icon: FaBook, color: '#3b82f6' },
    { value: 'social', label: 'Social', icon: FaBirthdayCake, color: '#ec4899' },
    { value: 'sports', label: 'Sports', icon: FaFutbol, color: '#10b981' },
    { value: 'cultural', label: 'Cultural', icon: FaTheaterMasks, color: '#f59e0b' },
    { value: 'career', label: 'Career', icon: FaBriefcase, color: '#8b5cf6' },
    { value: 'workshop', label: 'Workshop', icon: FaTools, color: '#06b6d4' },
    { value: 'other', label: 'Other', icon: FaStar, color: '#6b7280' },
  ];

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const upcomingCount = events.filter(e => {
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
      return eventDate > now;
    }).length;
    
    const thisWeek = events.filter(e => {
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate > now && eventDate <= weekFromNow;
    }).length;

    return {
      total: pagination.total || events.length,
      upcoming: upcomingCount,
      thisWeek,
    };
  }, [events, pagination.total]);

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
        {/* Hero Stats Section */}
        <div className="events-hero">
          <div className="hero-content">
            <h1 className="hero-title">Discover Amazing Events</h1>
            <p className="hero-subtitle">Explore upcoming events happening on campus</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item">
              <TrendingUp size={20} className="hero-stat-icon" />
              <div>
                <div className="hero-stat-value">{stats.total}</div>
                <div className="hero-stat-label">Total Events</div>
              </div>
            </div>
            <div className="hero-stat-item">
              <Calendar size={20} className="hero-stat-icon" />
              <div>
                <div className="hero-stat-value">{stats.upcoming}</div>
                <div className="hero-stat-label">Upcoming</div>
              </div>
            </div>
            <div className="hero-stat-item">
              <Clock size={20} className="hero-stat-icon" />
              <div>
                <div className="hero-stat-value">{stats.thisWeek}</div>
                <div className="hero-stat-label">This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Category Filters */}
        <div className="category-filters">
          <div className="category-chips">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => handleFilterChange('category', cat.value)}
                className={`category-chip ${localFilters.category === cat.value ? 'active' : ''}`}
                style={{ 
                  '--chip-color': cat.color,
                  backgroundColor: localFilters.category === cat.value ? `${cat.color}15` : 'white',
                  borderColor: localFilters.category === cat.value ? cat.color : '#e5e7eb',
                  color: localFilters.category === cat.value ? cat.color : '#6b7280',
                }}
              >
                <span className="category-icon">
                  <cat.icon size={16} />
                </span>
                <span>{cat.label}</span>
                {localFilters.category === cat.value && (
                  <X size={14} className="chip-close" />
                )}
              </button>
            ))}
          </div>
        </div>

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

          <div className="header-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            >
              <SlidersHorizontal size={18} />
              Filters
              {hasActiveFilters && <span className="filter-badge">{Object.values(localFilters).filter(v => v && v !== 'approved' && v !== 'date').length}</span>}
            </button>
            
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">
                  <SlidersHorizontal size={16} />
                  Sort By
                </label>
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

              {showAdvancedFilters && (
                <>
                  <div className="filter-group">
                    <label className="filter-label">
                      <MapPin size={16} />
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by location..."
                      className="filter-input"
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-label">
                      <Calendar size={16} />
                      Date Range
                    </label>
                    <div className="date-range-inputs">
                      <input
                        type="date"
                        placeholder="From"
                        className="filter-input"
                      />
                      <span>to</span>
                      <input
                        type="date"
                        placeholder="To"
                        className="filter-input"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="filters-actions">
              {showAdvancedFilters && (
                <button 
                  onClick={() => setShowAdvancedFilters(false)}
                  className="filter-action-btn secondary"
                >
                  <X size={16} />
                  Hide Advanced
                </button>
              )}
              {!showAdvancedFilters && (
                <button 
                  onClick={() => setShowAdvancedFilters(true)}
                  className="filter-action-btn secondary"
                >
                  <Sparkles size={16} />
                  Advanced Filters
                </button>
              )}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  <X size={16} />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <p className="results-count">
              {loading ? (
                <span className="loading-text">Loading events...</span>
              ) : (
                <>
                  <span className="count-number">{pagination.total || events.length}</span>
                  <span className="count-label"> event{(pagination.total || events.length) !== 1 ? 's' : ''} found</span>
                  {hasActiveFilters && (
                    <span className="filter-indicator">
                      <Filter size={14} />
                      Filtered
                    </span>
                  )}
                </>
              )}
            </p>
            {totalPages > 1 && !loading && (
              <p className="page-info">
                Page <strong>{pagination.currentPage || currentPage}</strong> of <strong>{totalPages}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Events Display */}
        {loading ? (
          <div className="events-loading">
            <SkeletonLoader type="card" count={viewMode === 'grid' ? 6 : 3} />
          </div>
        ) : events.length > 0 ? (
          <div className={`events-container events-${viewMode}`}>
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
            <div className="empty-state-icon">
              <Calendar size={64} />
              <div className="empty-state-glow"></div>
            </div>
            <h3 className="empty-state-title">No events found</h3>
            <p className="empty-state-text">
              {hasActiveFilters 
                ? "We couldn't find any events matching your filters"
                : "There are no upcoming events at the moment"}
            </p>
            <div className="empty-state-actions">
              {hasActiveFilters && (
                <button onClick={clearFilters} className="btn-primary">
                  <X size={18} />
                  Clear All Filters
                </button>
              )}
              {isAuthenticated && (
                <Link to="/events/create" className="btn-secondary">
                  <Sparkles size={18} />
                  Create Your First Event
                </Link>
              )}
            </div>
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

