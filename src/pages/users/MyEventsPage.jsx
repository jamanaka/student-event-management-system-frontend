import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Sparkles, 
  AlertCircle,
  Search,
  ChevronDown,
  RefreshCw,
  Download,
  BarChart3,
  Users,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { 
  FaClipboardList, 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaTimesCircle,
  FaRegCalendarCheck,
  FaUserFriends
} from 'react-icons/fa';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import DateRangePicker from '../../components/common/DateRangePicker';
import { useEventStore } from '../../store/useEventStore';
import { exportToCSV } from '../../utils/exportUtils';
import '../../css/users/MyEventsPage.css';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { 
    userEvents, 
    loading, 
    fetchUserEvents,
    deleteEvent
  } = useEventStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState('date-desc');
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter, fetchUserEvents]);

  const handleRefresh = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
      setPage(1);
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchUserEvents, statusFilter]);

  // Calculate comprehensive stats with performance improvements
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const events = userEvents || [];
    
    let pending = 0, approved = 0, rejected = 0, upcoming = 0, past = 0, today = 0;
    let totalAttendees = 0;
    let maxAttendance = 0;
    let popularEvent = 'None';

    events.forEach(e => {
      // Count by status
      if (e.status === 'pending') pending++;
      if (e.status === 'approved') approved++;
      if (e.status === 'rejected') rejected++;
      
      // Date calculations
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
      const isToday = eventDate >= todayStart && eventDate < new Date(todayStart.getTime() + 86400000);
      
      if (isToday) today++;
      if (eventDate > now && e.status === 'approved') upcoming++;
      if (eventDate < now) past++;
      
      // Attendance
      const attendees = e.currentAttendees || 0;
      totalAttendees += attendees;
      
      if (attendees > maxAttendance) {
        maxAttendance = attendees;
        popularEvent = e.title || 'None';
      }
    });

    const avgAttendance = events.length > 0 
      ? Math.round(totalAttendees / events.length) 
      : 0;

    return {
      total: events.length,
      pending,
      approved,
      rejected,
      upcoming,
      past,
      today,
      totalAttendees,
      avgAttendance,
      maxAttendance,
      popularEvent,
      fillRate: events.length > 0 
        ? Math.round((totalAttendees / events.reduce((sum, e) => sum + (e.capacity || 0), 0)) * 100) 
        : 0
    };
  }, [userEvents]);

  // Enhanced filtering and sorting with pagination
  const filteredEvents = useMemo(() => {
    let filtered = [...(userEvents || [])];

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'past') {
        // Special case for past events - show events that have already occurred
        const now = new Date();
        filtered = filtered.filter(event => {
          const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
          return eventDate < now;
        });
      } else {
        filtered = filtered.filter(event => event.status === statusFilter);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= dateRange.start && eventDate <= dateRange.end;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'attendees-desc':
          return (b.currentAttendees || 0) - (a.currentAttendees || 0);
        case 'attendees-asc':
          return (a.currentAttendees || 0) - (b.currentAttendees || 0);
        case 'capacity-desc':
          return (b.capacity || 0) - (a.capacity || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [userEvents, statusFilter, searchQuery, dateRange, selectedSort]);

  // Pagination logic
  const paginatedEvents = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handleDeleteClick = useCallback((eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (eventToDelete) {
      try {
        await deleteEvent(eventToDelete);
        await fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
      } catch (error) {
        console.error('Failed to delete event:', error);
      } finally {
        setShowDeleteModal(false);
        setEventToDelete(null);
      }
    }
  }, [eventToDelete, deleteEvent, fetchUserEvents, statusFilter]);

  const handleExport = useCallback(() => {
    const data = filteredEvents.map(event => ({
      Title: event.title,
      Date: event.date,
      Time: event.time,
      Location: event.location,
      Category: event.category,
      Status: event.status,
      Attendees: event.currentAttendees || 0,
      Capacity: event.capacity,
      'Fill Rate': `${Math.round(((event.currentAttendees || 0) / (event.capacity || 1)) * 100)}%`,
      'Created At': event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A',
      'Last Updated': event.updatedAt ? new Date(event.updatedAt).toLocaleDateString() : 'N/A'
    }));
    
    exportToCSV(data, `my-events-${new Date().toISOString().split('T')[0]}`);
  }, [filteredEvents]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setDateRange({ start: null, end: null });
    setStatusFilter('all');
    setSelectedSort('date-desc');
    setPage(1);
  }, []);

  const statusOptions = [
    { 
      value: 'all', 
      label: 'All Events', 
      icon: FaClipboardList, 
      color: '#6366f1', 
      count: stats.total,
      description: 'View all your events'
    },
    { 
      value: 'pending', 
      label: 'Pending', 
      icon: FaHourglassHalf, 
      color: '#f59e0b', 
      count: stats.pending,
      description: 'Awaiting approval'
    },
    { 
      value: 'approved', 
      label: 'Approved', 
      icon: FaCheckCircle, 
      color: '#10b981', 
      count: stats.approved,
      description: 'Ready to go!'
    },
    { 
      value: 'rejected', 
      label: 'Rejected', 
      icon: FaTimesCircle, 
      color: '#ef4444', 
      count: stats.rejected,
      description: 'Needs revision'
    },
    {
      value: 'upcoming',
      label: 'Upcoming',
      icon: Calendar,
      color: '#8b5cf6',
      count: stats.upcoming,
      description: 'Events in the future'
    },
    {
      value: 'past',
      label: 'Past Events',
      icon: FaRegCalendarCheck,
      color: '#64748b',
      count: stats.past,
      description: 'Completed events'
    },
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title A-Z' },
    { value: 'title-desc', label: 'Title Z-A' },
    { value: 'attendees-desc', label: 'Most Popular' },
    { value: 'attendees-asc', label: 'Least Popular' },
    { value: 'capacity-desc', label: 'Largest Capacity' },
  ];

  const itemsPerPageOptions = [6, 12, 24, 48];

  return (
    <DashboardLayout title="My Events">
      <div className="my-events-page">
        {/* Page Header */}
        <div className="my-events-page-header">
          <div className="my-events-header-content">
            <div className="my-events-header-title-section">
              <div className="header-breadcrumb">
                <span>Dashboard</span>
                <ChevronRight size={16} />
                <span className="current-page">My Events</span>
              </div>
              <h1 className="my-events-page-title">My Events</h1>
              <div className="my-events-header-stats">
                <span className="my-events-header-stat">
                  <FaRegCalendarCheck size={16} />
                  <span>{stats.total} Total</span>
                </span>
                <span className="my-events-header-stat">
                  <FaUserFriends size={16} />
                  <span>{stats.totalAttendees} Attendees</span>
                </span>
                <span className="my-events-header-stat">
                  <TrendingUp size={16} />
                  <span>{stats.fillRate}% Fill Rate</span>
                </span>
              </div>
            </div>
            <p className="my-events-page-subtitle">
              Manage and track all events you've created. Monitor attendance, view status, and analyze performance.
            </p>
          </div>
          <div className="my-events-header-actions">
            <button
              onClick={() => navigate('/events/analytics')}
              className="my-events-btn-secondary my-events-btn-analytics"
              title="View Analytics"
            >
              <BarChart3 size={18} />
              Analytics
            </button>
            <button
              onClick={() => navigate('/events/create')}
              className="my-events-btn-create"
            >
              <div className="my-events-btn-icon-wrapper">
                <Sparkles size={20} className="my-events-btn-icon" />
                <Sparkles size={20} className="my-events-btn-icon-sparkle" />
              </div>
              <span>Create New Event</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="my-events-stats">
          {statusOptions.map((stat) => (
            <div 
              key={stat.value}
              className={`my-events-stat-card-mini my-events-stat-${stat.value}`}
              onClick={() => setStatusFilter(stat.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setStatusFilter(stat.value)}
            >
              <div className="my-events-stat-mini-icon">
                <stat.icon size={24} />
              </div>
              <div className="my-events-stat-mini-content">
                <div className="my-events-stat-mini-value">{stat.count}</div>
                <div className="my-events-stat-mini-label">{stat.label}</div>
                <div className="my-events-stat-mini-trend">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters Bar */}
        <div className="my-events-filters-bar">
          <div className="my-events-filter-group">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search events by title, description, or location..."
              className="my-events-search-input"
              debounceMs={300}
            />
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="my-events-btn-filter-toggle"
            >
              <Filter size={18} />
              {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
              <ChevronDown size={16} className={showAdvancedFilters ? 'rotated' : ''} />
            </button>
            
            {showAdvancedFilters && (
              <div className="my-events-advanced-filters">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select date range"
                  className="my-events-date-range-picker"
                />
                
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="my-events-filter-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="my-events-items-per-page"
                >
                  <option value="">Items per page</option>
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>
                      Show {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="my-events-filter-actions">
            <div className="my-events-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`my-events-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`my-events-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              className="my-events-btn-refresh"
              disabled={refreshLoading || loading}
              title="Refresh events"
            >
              <RefreshCw size={18} className={refreshLoading ? 'spinning' : ''} />
              {refreshLoading ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {filteredEvents.length > 0 && (
              <button
                onClick={handleExport}
                className="my-events-btn-export"
                title="Export to CSV"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || dateRange.start || statusFilter !== 'all') && (
          <div className="my-events-active-filters">
            <div className="my-events-active-filters-header">
              <span>Active Filters:</span>
              <button
                onClick={handleClearFilters}
                className="my-events-clear-filters-btn"
              >
                Clear All
              </button>
            </div>
            <div className="my-events-active-filters-list">
              {searchQuery && (
                <span className="my-events-active-filter">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>×</button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="my-events-active-filter">
                  Status: {statusOptions.find(o => o.value === statusFilter)?.label}
                  <button onClick={() => setStatusFilter('all')}>×</button>
                </span>
              )}
              {dateRange.start && dateRange.end && (
                <span className="my-events-active-filter">
                  Date: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                  <button onClick={() => setDateRange({ start: null, end: null })}>×</button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="my-events-results-header">
          <div className="my-events-results-info">
            <div className="my-events-results-count">
              {loading ? (
                <span className="my-events-loading-text">
                  <RefreshCw size={16} className="spinning" />
                  Loading events...
                </span>
              ) : (
                <>
                  <div className="my-events-count-display">
                    <span className="my-events-count-number">{filteredEvents.length}</span>
                    <span className="my-events-count-label"> event{filteredEvents.length !== 1 ? 's' : ''}</span>
                    {searchQuery && (
                      <span className="my-events-search-indicator">
                        matching "{searchQuery}"
                      </span>
                    )}
                  </div>
                  
                  <div className="my-events-results-meta">
                    {filteredEvents.length > 0 && (
                      <>
                        <span className="my-events-results-summary">
                          <CheckCircle size={14} color="#10b981" />
                          {filteredEvents.filter(e => e.status === 'approved').length} approved
                        </span>
                        <span className="my-events-results-summary">
                          <Clock size={14} color="#f59e0b" />
                          {filteredEvents.filter(e => e.status === 'pending').length} pending
                        </span>
                        <span className="my-events-results-summary">
                          <Users size={14} color="#3b82f6" />
                          {filteredEvents.reduce((sum, e) => sum + (e.currentAttendees || 0), 0)} attendees
                        </span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {!loading && filteredEvents.length > 0 && (
              <div className="my-events-pagination-summary">
                <span>Page {page} of {totalPages}</span>
                <span>•</span>
                <span>Showing {paginatedEvents.length} of {filteredEvents.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid/List */}
        {loading ? (
          <div className="my-events-loading">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className={`my-events-container my-events-${viewMode}`}>
              {paginatedEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  showActions={true}
                  showStatus={true}
                  variant={viewMode}
                  onDelete={() => handleDeleteClick(event._id)}
                  onEdit={() => navigate(`/events/${event._id}/edit`)}
                  onView={() => navigate(`/events/${event._id}`)}
                  onManage={() => navigate(`/events/${event._id}/manage`)}
                />
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="my-events-pagination-controls">
                <div className="my-events-pagination-info">
                  Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                </div>
                <div className="my-events-pagination-buttons">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="my-events-btn-pagination"
                  >
                    Previous
                  </button>
                  
                  <div className="my-events-page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`my-events-page-btn ${page === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && (
                      <>
                        {page < totalPages - 2 && <span className="my-events-page-ellipsis">...</span>}
                        {page < totalPages - 2 && (
                          <button
                            onClick={() => setPage(totalPages)}
                            className={`my-events-page-btn ${page === totalPages ? 'active' : ''}`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="my-events-btn-pagination"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="my-events-empty-state">
            <div className="my-events-empty-state-icon">
              {searchQuery || dateRange.start ? (
                <Search size={64} />
              ) : statusFilter === 'all' ? (
                <PlusCircle size={64} />
              ) : statusFilter === 'pending' ? (
                <Clock size={64} />
              ) : statusFilter === 'approved' ? (
                <CheckCircle size={64} />
              ) : (
                <XCircle size={64} />
              )}
              <div className="my-events-empty-state-glow"></div>
            </div>
            <h3 className="my-events-empty-state-title">
              {searchQuery
                ? "No events found matching your search"
                : dateRange.start
                ? "No events found in selected date range"
                : statusFilter === 'all'
                ? "You haven't created any events yet"
                : `No ${statusOptions.find(o => o.value === statusFilter)?.label.toLowerCase()} events`}
            </h3>
            <p className="my-events-empty-state-text">
              {searchQuery || dateRange.start
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : statusFilter === 'all'
                ? "Start organizing amazing events for your campus community! Create your first event to get started."
                : `You don't have any ${statusOptions.find(o => o.value === statusFilter)?.label.toLowerCase()} events at the moment.`}
            </p>
            <div className="my-events-empty-state-actions">
              {(searchQuery || dateRange.start || statusFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="my-events-btn-secondary"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => navigate('/events/create')}
                className="my-events-btn-primary"
              >
                <Sparkles size={18} />
                Create Your First Event
              </button>
              <button
                onClick={() => navigate('/events')}
                className="my-events-btn-secondary"
              >
                Browse All Events
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setEventToDelete(null);
          }}
          title="Delete Event"
          size="sm"
        >
          <div className="my-events-delete-modal-content">
            <div className="my-events-delete-warning">
              <AlertCircle size={48} color="#ef4444" />
              <p>Are you sure you want to delete this event?</p>
              <p className="my-events-warning-text">
                This action cannot be undone. All RSVPs and associated data will be permanently removed.
                Any attendees who registered will be notified.
              </p>
            </div>
            <div className="my-events-modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                className="my-events-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="my-events-btn-delete"
              >
                <XCircle size={18} />
                Delete Event
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyEventsPage;