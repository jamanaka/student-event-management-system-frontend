import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Clock, XCircle, Users, CheckCircle, CalendarCheck,
  Filter, AlertCircle, Sparkles, ChevronDown, Search,
  Calendar, MapPin, TrendingUp, Download, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import DateRangePicker from '../../components/common/DateRangePicker';
import { useRSVPStore } from '../../store/useRSVPStore';
import { Link } from 'react-router-dom';
import { exportToCSV } from '../../utils/exportUtils';
import '../../css/users/MyRSVPsPage.css';

const MyRSVPsPage = () => {
  const {
    rsvps,
    loading,
    fetchUserRSVPs,
    removeRSVP
  } = useRSVPStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rsvpToCancel, setRsvpToCancel] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('date-asc');
  const [refreshLoading, setRefreshLoading] = useState(false);

  useEffect(() => {
    fetchUserRSVPs();
  }, [fetchUserRSVPs]);

  const handleRefresh = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchUserRSVPs();
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchUserRSVPs]);

  const parseEventDateTime = useCallback((event) => {
    if (!event || !event.date) return null;
    
    let eventDate = event.date;
    
    if (eventDate instanceof Date) {
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      eventDate = `${year}-${month}-${day}`;
    } else if (typeof eventDate === 'string') {
      eventDate = eventDate.split('T')[0].split(' ')[0];
    }
    
    const time = event.time || '00:00';
    const eventDateTime = new Date(`${eventDate}T${time}`);
    
    if (isNaN(eventDateTime.getTime())) {
      console.error('[MyRSVPsPage] Invalid date:', { 
        eventId: event._id, 
        originalDate: event.date 
      });
      return null;
    }
    
    return eventDateTime;
  }, []);

  // Categorize RSVPs
  const categorizedRSVPs = useMemo(() => {
    const upcoming = [];
    const past = [];
    
    rsvps.forEach(rsvp => {
      const event = typeof rsvp.event === 'string' ? null : rsvp.event;
      if (!event) return;
      
      const eventDateTime = parseEventDateTime(event);
      if (!eventDateTime) return;
      
      const now = new Date();
      if (eventDateTime > now) {
        upcoming.push({ ...rsvp, eventDateTime, isPast: false });
      } else {
        past.push({ ...rsvp, eventDateTime, isPast: true });
      }
    });
    
    // Sort upcoming by date (ascending), past by date (descending)
    upcoming.sort((a, b) => a.eventDateTime - b.eventDateTime);
    past.sort((a, b) => b.eventDateTime - a.eventDateTime);
    
    return { upcoming, past };
  }, [rsvps, parseEventDateTime]);

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    const { upcoming, past } = categorizedRSVPs;
    const total = upcoming.length + past.length;
    
    const totalGuests = rsvps.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0);
    const upcomingGuests = upcoming.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0);
    const pastGuests = past.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0);
    
    // Calculate attendance rate
    const attendanceRate = total > 0 
      ? Math.round((past.length / total) * 100) 
      : 0;
    
    // Find most attended category
    const categoryCounts = {};
    past.forEach(rsvp => {
      const event = typeof rsvp.event === 'string' ? null : rsvp.event;
      if (event?.category) {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
      }
    });
    
    const favoriteCategory = Object.keys(categoryCounts).length > 0
      ? Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0]
      : 'None';
    
    return {
      total,
      upcoming: upcoming.length,
      past: past.length,
      totalGuests,
      upcomingGuests,
      pastGuests,
      attendanceRate,
      favoriteCategory,
      daysToNextEvent: upcoming.length > 0 
        ? Math.ceil((upcoming[0].eventDateTime - new Date()) / (1000 * 60 * 60 * 24))
        : null
    };
  }, [categorizedRSVPs, rsvps]);

  // Filter and sort RSVPs
  const displayedRSVPs = useMemo(() => {
    let filtered = [];
    
    switch (filterTab) {
      case 'upcoming':
        filtered = categorizedRSVPs.upcoming;
        break;
      case 'past':
        filtered = categorizedRSVPs.past;
        break;
      default:
        filtered = [...categorizedRSVPs.upcoming, ...categorizedRSVPs.past];
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rsvp => {
        const event = typeof rsvp.event === 'string' ? null : rsvp.event;
        if (!event) return false;
        
        return (
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.category?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(rsvp => {
        const eventDateTime = rsvp.eventDateTime;
        return eventDateTime >= dateRange.start && eventDateTime <= dateRange.end;
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date-asc':
          return a.eventDateTime - b.eventDateTime;
        case 'date-desc':
          return b.eventDateTime - a.eventDateTime;
        case 'guests-asc':
          return (a.numberOfGuests || 0) - (b.numberOfGuests || 0);
        case 'guests-desc':
          return (b.numberOfGuests || 0) - (a.numberOfGuests || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [filterTab, categorizedRSVPs, searchQuery, dateRange, selectedSort]);

  const handleCancelRSVP = useCallback(async () => {
    if (rsvpToCancel) {
      const eventId = typeof rsvpToCancel.event === 'string' 
        ? rsvpToCancel.event 
        : rsvpToCancel.event._id;
      const success = await removeRSVP(eventId);
      if (success) {
        setShowCancelModal(false);
        setRsvpToCancel(null);
        handleRefresh();
      }
    }
  }, [rsvpToCancel, removeRSVP, handleRefresh]);

  const openCancelModal = useCallback((rsvp) => {
    setRsvpToCancel(rsvp);
    setShowCancelModal(true);
  }, []);


  const handleExportRSVPs = useCallback(() => {
    const data = displayedRSVPs.map(rsvp => {
      const event = typeof rsvp.event === 'string' ? {} : rsvp.event;
      const eventDateTime = parseEventDateTime(event);
      
      return {
        'Event Title': event.title || 'N/A',
        'Event Date': eventDateTime ? eventDateTime.toLocaleDateString() : 'N/A',
        'Event Time': event.time || 'N/A',
        'Event Location': event.location || 'N/A',
        'Event Category': event.category || 'N/A',
        'Number of Guests': rsvp.numberOfGuests || 0,
        'RSVP Status': rsvp.isPast ? 'Attended' : 'Upcoming',
        'RSVP Date': rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : 'N/A'
      };
    });
    
    exportToCSV(data, `my-rsvps-${new Date().toISOString().split('T')[0]}`);
  }, [displayedRSVPs, parseEventDateTime]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange({ start: null, end: null });
    setFilterTab('all');
    setSelectedSort('date-asc');
  }, []);

  const sortOptions = [
    { value: 'date-asc', label: 'Date (Earliest First)' },
    { value: 'date-desc', label: 'Date (Latest First)' },
    { value: 'guests-asc', label: 'Guests (Fewest First)' },
    { value: 'guests-desc', label: 'Guests (Most First)' },
  ];


  return (
    <DashboardLayout title="My RSVPs">
      <div className="my-rsvps-page">
        {/* Page Header */}
        <div className="my-rsvps-page-header">
          <div className="my-rsvps-header-content">
            <div className="my-rsvps-header-title-section">
              <h1 className="my-rsvps-page-title">My RSVPs</h1>
              <div className="my-rsvps-header-stats">
                <span className="my-rsvps-header-stat">
                  <CalendarCheck size={16} />
                  <span>{stats.total} Total</span>
                </span>
                <span className="my-rsvps-header-stat">
                  <TrendingUp size={16} />
                  <span>{stats.attendanceRate}% Attendance</span>
                </span>
                {stats.daysToNextEvent !== null && (
                  <span className="my-rsvps-header-stat">
                    <Clock size={16} />
                    <span>{stats.daysToNextEvent} days to next</span>
                  </span>
                )}
              </div>
            </div>
            <p className="my-rsvps-page-subtitle">
              Manage and track events you're attending or have attended. Never miss an event!
            </p>
          </div>
          <div className="my-rsvps-header-actions">
            <button
              onClick={handleRefresh}
              className="my-rsvps-btn-secondary"
              disabled={refreshLoading || loading}
              title="Refresh RSVPs"
            >
              <RefreshCw size={18} className={refreshLoading ? 'spinning' : ''} />
              Refresh
            </button>
            {displayedRSVPs.length > 0 && (
              <button
                onClick={handleExportRSVPs}
                className="my-rsvps-btn-secondary"
                title="Export to CSV"
              >
                <Download size={18} />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && rsvps.length > 0 && (
          <div className="my-rsvps-stats">
            {[
              { 
                value: stats.total, 
                label: 'Total RSVPs', 
                icon: CalendarCheck,
                color: '#6366f1',
                description: 'All events you RSVP\'d to'
              },
              { 
                value: stats.upcoming, 
                label: 'Upcoming', 
                icon: Clock,
                color: '#f59e0b',
                description: 'Events happening soon'
              },
              { 
                value: stats.past, 
                label: 'Past', 
                icon: CheckCircle,
                color: '#10b981',
                description: 'Events you attended'
              },
              { 
                value: stats.totalGuests, 
                label: 'Total Guests', 
                icon: Users,
                color: '#8b5cf6',
                description: 'Guests you brought along'
              },
            ].map((stat, index) => (
              <div 
                key={index}
                className={`my-rsvps-stat-card-mini my-rsvps-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  if (stat.label === 'Upcoming') setFilterTab('upcoming');
                  if (stat.label === 'Past') setFilterTab('past');
                }}
              >
                <div className="my-rsvps-stat-mini-icon">
                  <stat.icon size={20} />
                </div>
                <div className="my-rsvps-stat-mini-content">
                  <div className="my-rsvps-stat-mini-value">{stat.value}{stat.label === 'Attendance Rate' ? '%' : ''}</div>
                  <div className="my-rsvps-stat-mini-label">{stat.label}</div>
                  <div className="my-rsvps-stat-mini-description">{stat.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="my-rsvps-filters-bar">
          <div className="my-rsvps-filter-group">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search RSVPs by event title, description, or location..."
              className="my-rsvps-search-input"
            />
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="my-rsvps-btn-filter-toggle"
            >
              <Filter size={18} />
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              <ChevronDown size={16} className={showAdvancedFilters ? 'rotated' : ''} />
            </button>
            
            {showAdvancedFilters && (
              <div className="my-rsvps-advanced-filters">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Filter by event date range"
                />
                
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="my-rsvps-filter-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || dateRange.start || filterTab !== 'all') && (
          <div className="my-rsvps-active-filters">
            <div className="my-rsvps-active-filters-header">
              <span>Active Filters:</span>
              <button
                onClick={handleClearFilters}
                className="my-rsvps-clear-filters-btn"
              >
                Clear All
              </button>
            </div>
            <div className="my-rsvps-active-filters-list">
              {searchQuery && (
                <span className="my-rsvps-active-filter">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>×</button>
                </span>
              )}
              {filterTab !== 'all' && (
                <span className="my-rsvps-active-filter">
                  Status: {filterTab === 'upcoming' ? 'Upcoming' : 'Past'}
                  <button onClick={() => setFilterTab('all')}>×</button>
                </span>
              )}
              {dateRange.start && dateRange.end && (
                <span className="my-rsvps-active-filter">
                  Date: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                  <button onClick={() => setDateRange({ start: null, end: null })}>×</button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && rsvps.length > 0 && (
          <div className="my-rsvps-filter-tabs">
            <button
              onClick={() => setFilterTab('all')}
              className={`my-rsvps-filter-tab ${filterTab === 'all' ? 'active' : ''}`}
            >
              <CalendarCheck size={18} />
              All RSVPs
              {stats.total > 0 && <span className="my-rsvps-tab-count">{stats.total}</span>}
            </button>
            <button
              onClick={() => setFilterTab('upcoming')}
              className={`my-rsvps-filter-tab ${filterTab === 'upcoming' ? 'active' : ''}`}
            >
              <Clock size={18} />
              Upcoming
              {stats.upcoming > 0 && <span className="my-rsvps-tab-count">{stats.upcoming}</span>}
            </button>
            <button
              onClick={() => setFilterTab('past')}
              className={`my-rsvps-filter-tab ${filterTab === 'past' ? 'active' : ''}`}
            >
              <CheckCircle size={18} />
              Past
              {stats.past > 0 && <span className="my-rsvps-tab-count">{stats.past}</span>}
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && displayedRSVPs.length > 0 && (
          <div className="my-rsvps-results-header">
            <div className="my-rsvps-results-info">
              <div className="my-rsvps-results-count">
                <span className="my-rsvps-count-number">{displayedRSVPs.length}</span>
                <span className="my-rsvps-count-label"> RSVP{displayedRSVPs.length !== 1 ? 's' : ''}</span>
                {filterTab !== 'all' && (
                  <span className="my-rsvps-filter-indicator">
                    <Filter size={14} />
                    {filterTab === 'upcoming' ? 'Upcoming' : 'Past'}
                  </span>
                )}
              </div>
              
              <div className="my-rsvps-results-summary">
                <span className="my-rsvps-summary-item">
                  <Calendar size={14} />
                  Next: {displayedRSVPs[0]?.isPast ? 'N/A' : 
                    new Date(displayedRSVPs[0]?.eventDateTime).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                </span>
                <span className="my-rsvps-summary-item">
                  <Users size={14} />
                  {displayedRSVPs.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0)} guests
                </span>
                <span className="my-rsvps-summary-item">
                  <MapPin size={14} />
                  {new Set(displayedRSVPs.map(rsvp => {
                    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
                    return event?.location || 'Unknown';
                  })).size} locations
                </span>
              </div>
            </div>
          </div>
        )}

        {/* RSVPs List */}
        {loading ? (
          <div className="my-rsvps-loading">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : displayedRSVPs.length > 0 ? (
          <>
            <div className="my-rsvps-grid">
              {displayedRSVPs.map((rsvp) => {
                const event = typeof rsvp.event === 'string' ? null : rsvp.event;
                if (!event) return null;
                
                return (
                  <div key={rsvp._id} className={`my-rsvps-card-wrapper ${rsvp.isPast ? 'past-event' : 'upcoming-event'}`}>
                    <EventCard 
                      event={event} 
                      showStatus={false}
                      skipRSVPCheck={true}
                      showCancelRSVP={!rsvp.isPast}
                      onCancelRSVP={() => openCancelModal(rsvp)}
                      numberOfGuests={rsvp.numberOfGuests || 0}
                      variant="rsvp"
                    />
                    
                    {rsvp.numberOfGuests > 0 && (
                      <div className="my-rsvps-guests-info">
                        <Users size={14} />
                        <span>
                          <strong>{rsvp.numberOfGuests}</strong> guest{rsvp.numberOfGuests !== 1 ? 's' : ''}
                          {rsvp.isPast ? ' attended with you' : ' attending with you'}
                        </span>
                      </div>
                    )}
                    
                    {rsvp.createdAt && (
                      <div className="my-rsvps-meta-info">
                        RSVP'd on {new Date(rsvp.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="my-rsvps-pagination-summary">
              Showing {displayedRSVPs.length} of {stats.total} RSVPs
            </div>
          </>
        ) : (
          <div className="my-rsvps-empty-state">
            <div className="my-rsvps-empty-state-icon">
              {searchQuery || dateRange.start ? (
                <Search size={64} />
              ) : filterTab === 'all' ? (
                <CalendarCheck size={64} />
              ) : filterTab === 'upcoming' ? (
                <Clock size={64} />
              ) : (
                <CheckCircle size={64} />
              )}
              <div className="my-rsvps-empty-state-glow"></div>
            </div>
            <h3 className="my-rsvps-empty-state-title">
              {searchQuery || dateRange.start
                ? "No RSVPs found matching your search"
                : filterTab === 'all'
                ? "You haven't RSVP'd to any events yet"
                : filterTab === 'upcoming'
                ? 'No upcoming RSVPs'
                : 'No past RSVPs'}
            </h3>
            <p className="my-rsvps-empty-state-text">
              {searchQuery || dateRange.start
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : filterTab === 'all'
                ? "Start exploring events and RSVP to attend amazing campus activities!"
                : filterTab === 'upcoming'
                ? "You don't have any upcoming events at the moment. Check out available events!"
                : "You haven't attended any events yet. Time to start joining some events!"}
            </p>
            <div className="my-rsvps-empty-state-actions">
              {(searchQuery || dateRange.start || filterTab !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="my-rsvps-btn-secondary"
                >
                  Clear Filters
                </button>
              )}
              <Link to="/events" className="my-rsvps-btn-primary">
                <Sparkles size={18} />
                Browse Events
              </Link>
              {filterTab === 'past' && (
                <Link to="/events?filter=upcoming" className="my-rsvps-btn-secondary">
                  View Upcoming Events
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Cancel RSVP Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setRsvpToCancel(null);
          }}
          title="Cancel RSVP"
          size="sm"
        >
          {rsvpToCancel && (
            <div className="my-rsvps-cancel-modal-content">
              <div className="my-rsvps-cancel-warning">
                <AlertCircle size={48} color="#ef4444" />
                <p>
                  Are you sure you want to cancel your RSVP for{' '}
                  <strong>
                    {typeof rsvpToCancel.event === 'string' 
                      ? 'this event' 
                      : rsvpToCancel.event.title}
                  </strong>?
                </p>
                <p className="my-rsvps-warning-text">
                  This will free up {rsvpToCancel.numberOfGuests + 1} spot(s) for other attendees.
                  You'll need to RSVP again if you change your mind.
                </p>
              </div>
              <div className="my-rsvps-modal-actions">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setRsvpToCancel(null);
                  }}
                  className="my-rsvps-btn-cancel"
                >
                  Keep RSVP
                </button>
                <button
                  onClick={handleCancelRSVP}
                  className="my-rsvps-btn-confirm-cancel"
                  disabled={loading}
                >
                  <XCircle size={18} />
                  Cancel RSVP
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyRSVPsPage;