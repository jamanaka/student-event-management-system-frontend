import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Filter } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import Modal from '../../components/common/Modal';
import { useEventStore } from '../../store/useEventStore';
import '../../css/admin/PendingEvents.css';

const PendingEvents = () => {
  const { 
    pendingEvents, 
    loading, 
    fetchPendingEvents, 
    approveEvent,
    rejectEvent
  } = useEventStore();
  
  const [selectedEvent, setSelectedEvent] = React.useState(null);
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [stats, setStats] = React.useState({
    total: 0,
    newToday: 0,
    averageAge: 0
  });

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

  useEffect(() => {
    if (pendingEvents.length > 0) {
      const now = new Date();
      const newToday = pendingEvents.filter(event => {
        const created = new Date(event.createdAt);
        return created.toDateString() === now.toDateString();
      }).length;

      const totalAge = pendingEvents.reduce((acc, event) => {
        const created = new Date(event.createdAt);
        const ageHours = (now - created) / (1000 * 60 * 60);
        return acc + ageHours;
      }, 0);

      setStats({
        total: pendingEvents.length,
        newToday,
        averageAge: Math.round(totalAge / pendingEvents.length)
      });
    } else {
      setStats({ total: 0, newToday: 0, averageAge: 0 });
    }
  }, [pendingEvents]);

  const handleApprove = async (eventId) => {
    const success = await approveEvent(eventId);
    if (success) {
      fetchPendingEvents();
    }
  };

  const handleRejectClick = (event) => {
    setSelectedEvent(event);
    setRejectModalOpen(true);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (selectedEvent) {
      const success = await rejectEvent(selectedEvent._id, rejectReason.trim());
      if (success) {
        setRejectModalOpen(false);
        setSelectedEvent(null);
        setRejectReason('');
        fetchPendingEvents();
      }
    }
  };

  const getFilteredEvents = () => {
    if (filter === 'new') {
      return pendingEvents.filter(event => {
        const created = new Date(event.createdAt);
        const now = new Date();
        return (now - created) < 24 * 60 * 60 * 1000; // Within 24 hours
      });
    } else if (filter === 'old') {
      return pendingEvents.filter(event => {
        const created = new Date(event.createdAt);
        const now = new Date();
        return (now - created) >= 24 * 60 * 60 * 1000; // Older than 24 hours
      });
    }
    return pendingEvents;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <DashboardLayout title="Pending Events" isAdmin={true}>
      <div className="admin-pending-events-page">
        {/* Stats Header */}
        <div className="admin-pending-stats">
          <div className="admin-stat-badge">
            <div className="admin-stat-badge-icon">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="admin-stat-badge-label">Pending Review</div>
              <div className="admin-stat-badge-value">{stats.total} events</div>
            </div>
          </div>
          
          <div className="admin-stat-badge">
            <div className="admin-stat-badge-icon">
              <Clock size={20} />
            </div>
            <div>
              <div className="admin-stat-badge-label">Avg. Wait Time</div>
              <div className="admin-stat-badge-value">{stats.averageAge}h</div>
            </div>
          </div>
          
          <div className="admin-stat-badge">
            <div className="admin-stat-badge-icon">
              <CheckCircle size={20} />
            </div>
            <div>
              <div className="admin-stat-badge-label">New Today</div>
              <div className="admin-stat-badge-value">{stats.newToday} events</div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="admin-pending-filters">
          <div className="admin-filter-tabs">
            <button
              className={`admin-filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Pending
            </button>
            <button
              className={`admin-filter-tab ${filter === 'new' ? 'active' : ''}`}
              onClick={() => setFilter('new')}
            >
              New (24h)
            </button>
            <button
              className={`admin-filter-tab ${filter === 'old' ? 'active' : ''}`}
              onClick={() => setFilter('old')}
            >
              Older (24h+)
            </button>
          </div>
          <div className="admin-pending-count">
            Showing {filteredEvents.length} of {pendingEvents.length} events
          </div>
        </div>

        {loading ? (
          <div className="admin-pending-skeleton">
            <div className="admin-skeleton-filters">
              <div className="skeleton-filter-tabs">
                <div className="skeleton-tab"></div>
                <div className="skeleton-tab"></div>
                <div className="skeleton-tab"></div>
              </div>
              <div className="skeleton-count"></div>
            </div>
            <div className="admin-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-event-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-meta">
                      <div className="skeleton-meta-item"></div>
                      <div className="skeleton-meta-item"></div>
                    </div>
                    <div className="skeleton-actions">
                      <div className="skeleton-button"></div>
                      <div className="skeleton-button"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : pendingEvents.length > 0 ? (
          <>
            {filteredEvents.length === 0 ? (
              <div className="admin-filter-empty">
                <Filter size={48} />
                <h3>No events match your filter</h3>
                <p>Try selecting a different filter option</p>
              </div>
            ) : (
              <div className="admin-events-grid">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    showStatus={true}
                    adminView={true}
                    showAdminActions={true}
                    onApprove={handleApprove}
                    onReject={handleRejectClick}
                    showCreatedTime={true}
                  />
                ))}
              </div> 
            )}
          </>
        ) : (
          <div className="admin-empty-state">
            <div className="admin-empty-icon">
              <CheckCircle size={64} />
            </div>
            <h3>All caught up! 🎉</h3>
            <p className="admin-empty-subtitle">There are no pending events to review.</p>
            <p className="admin-empty-desc">
              New event submissions will appear here for your review.
            </p>
          </div>
        )}

        {/* Reject Modal */}
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedEvent(null);
            setRejectReason('');
          }}
          title="Reject Event Submission"
          showCloseButton={true}
        >
          {selectedEvent && (
            <div className="admin-reject-modal-content">
              <div className="admin-modal-preview">
                <div className="admin-modal-event-title">{selectedEvent.title}</div>
                <div className="admin-modal-event-category">{selectedEvent.category}</div>
                <div className="admin-modal-event-desc">
                  {selectedEvent.description.substring(0, 100)}...
                </div>
              </div>
              
              <p className="admin-modal-text">
                Please provide a reason for rejecting this event:
              </p>
              
              <div className="admin-form-group">
                <label htmlFor="rejectReason" className="admin-form-label">
                  Reason for Rejection <span className="admin-required">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  className="admin-form-textarea"
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Example: The event description needs more details about the agenda, or the image quality is too low..."
                  required
                  autoFocus
                />
                <div className="admin-char-count">
                  {rejectReason.length}/500 characters
                </div>
              </div>
              
              <div className="admin-rejection-note">
                <AlertCircle size={16} />
                <span>This reason will be sent to the event organizer.</span>
              </div>
              
              <div className="admin-modal-actions">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setSelectedEvent(null);
                    setRejectReason('');
                  }}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="admin-btn-reject-submit"
                  disabled={!rejectReason.trim() || rejectReason.length > 500}
                >
                  <XCircle size={18} />
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default PendingEvents;