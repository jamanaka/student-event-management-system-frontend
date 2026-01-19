import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Filter, Calendar, CheckCircle, Clock, XCircle, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DashboardLayout from '../components/common/DashboardLayout';
import EventCard from '../components/common/EventCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import Modal from '../components/common/Modal';
import { useEventStore } from '../store/useEventStore';
import '../css/users/MyEventsPage.css';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { 
    userEvents, 
    loading, 
    fetchUserEvents,
    deleteEvent 
  } = useEventStore();

  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const pending = userEvents.filter(e => e.status === 'pending').length;
    const approved = userEvents.filter(e => e.status === 'approved').length;
    const rejected = userEvents.filter(e => e.status === 'rejected').length;
    const upcoming = userEvents.filter(e => {
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
      return eventDate > now && e.status === 'approved';
    }).length;
    const past = userEvents.filter(e => {
      const eventDate = new Date(`${e.date}T${e.time || '00:00'}`);
      return eventDate < now;
    }).length;
    const totalAttendees = userEvents.reduce((sum, e) => sum + (e.currentAttendees || 0), 0);

    return {
      total: userEvents.length,
      pending,
      approved,
      rejected,
      upcoming,
      past,
      totalAttendees,
    };
  }, [userEvents]);

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete);
      fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Events', icon: FaClipboardList, color: '#6366f1', count: stats.total },
    { value: 'pending', label: 'Pending', icon: FaHourglassHalf, color: '#f59e0b', count: stats.pending },
    { value: 'approved', label: 'Approved', icon: FaCheckCircle, color: '#10b981', count: stats.approved },
    { value: 'rejected', label: 'Rejected', icon: FaTimesCircle, color: '#ef4444', count: stats.rejected },
  ];

  const filteredEvents = statusFilter === 'all' 
    ? userEvents 
    : userEvents.filter(event => event.status === statusFilter);

  return (
    <DashboardLayout title="My Events">
      <div className="my-events-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">Manage and track all events you've created</p>
          </div>
          <button
            onClick={() => navigate('/events/create')}
            className="btn-create"
          >
            <div className="btn-icon-wrapper">
              <Sparkles size={20} className="btn-icon" />
              <Sparkles size={20} className="btn-icon-sparkle" />
            </div>
            <span>Create New Event</span>
          </button>
        </div>

        {/* Stats Overview */}
        {!loading && userEvents.length > 0 && (
          <div className="events-stats">
            <div className="stat-card-mini stat-total">
              <div className="stat-mini-icon">
                <Calendar size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.total}</div>
                <div className="stat-mini-label">Total Events</div>
              </div>
            </div>
            <div className="stat-card-mini stat-approved">
              <div className="stat-mini-icon">
                <CheckCircle size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.approved}</div>
                <div className="stat-mini-label">Approved</div>
              </div>
            </div>
            <div className="stat-card-mini stat-pending">
              <div className="stat-mini-icon">
                <Clock size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.pending}</div>
                <div className="stat-mini-label">Pending</div>
              </div>
            </div>
            <div className="stat-card-mini stat-upcoming">
              <div className="stat-mini-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.upcoming}</div>
                <div className="stat-mini-label">Upcoming</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter Chips */}
        <div className="status-filters">
          <div className="status-chips">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`status-chip ${statusFilter === opt.value ? 'active' : ''}`}
                style={{
                  '--chip-color': opt.color,
                  backgroundColor: statusFilter === opt.value ? `${opt.color}15` : 'white',
                  borderColor: statusFilter === opt.value ? opt.color : '#e5e7eb',
                  color: statusFilter === opt.value ? opt.color : '#6b7280',
                }}
              >
                <span className="status-icon">
                  <opt.icon size={16} />
                </span>
                <span>{opt.label}</span>
                {opt.count > 0 && (
                  <span className="status-count">{opt.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="results-header">
          <div className="results-info">
            <p className="results-count">
              {loading ? (
                <span className="loading-text">Loading events...</span>
              ) : (
                <>
                  <span className="count-number">{filteredEvents.length}</span>
                  <span className="count-label"> event{filteredEvents.length !== 1 ? 's' : ''}</span>
                  {statusFilter !== 'all' && (
                    <span className="filter-indicator">
                      <Filter size={14} />
                      {statusOptions.find(o => o.value === statusFilter)?.label}
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="events-loading">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                showActions={true}
                showStatus={true}
                onDelete={() => handleDeleteClick(event._id)}
                onEdit={() => navigate(`/events/${event._id}/edit`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              {statusFilter === 'all' ? (
                <PlusCircle size={64} />
              ) : statusFilter === 'pending' ? (
                <Clock size={64} />
              ) : statusFilter === 'approved' ? (
                <CheckCircle size={64} />
              ) : (
                <XCircle size={64} />
              )}
              <div className="empty-state-glow"></div>
            </div>
            <h3 className="empty-state-title">
              {statusFilter === 'all'
                ? "You haven't created any events yet"
                : `No ${statusOptions.find(o => o.value === statusFilter)?.label.toLowerCase()} events`}
            </h3>
            <p className="empty-state-text">
              {statusFilter === 'all'
                ? "Start organizing amazing events for your campus community!"
                : `You don't have any ${statusOptions.find(o => o.value === statusFilter)?.label.toLowerCase()} events at the moment.`}
            </p>
            <div className="empty-state-actions">
              <button
                onClick={() => navigate('/events/create')}
                className="btn-primary"
              >
                <Sparkles size={18} />
                Create Your First Event
              </button>
              {statusFilter !== 'all' && (
                <button
                  onClick={() => setStatusFilter('all')}
                  className="btn-secondary"
                >
                  View All Events
                </button>
              )}
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
        >
          <div className="delete-modal-content">
            <div className="delete-warning">
              <AlertCircle size={48} color="#ef4444" />
              <p>Are you sure you want to delete this event?</p>
              <p className="warning-text">This action cannot be undone. All RSVPs and associated data will be permanently removed.</p>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="btn-delete"
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

