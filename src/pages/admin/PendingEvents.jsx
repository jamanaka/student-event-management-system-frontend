import React, { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import Spinner from '../../components/common/Spinner';
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

  useEffect(() => {
    fetchPendingEvents();
  }, [fetchPendingEvents]);

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

  return (
    <DashboardLayout title="Pending Events" isAdmin={true}>
      <div className="admin-pending-events-page">
        {loading ? (
          <Spinner />
        ) : pendingEvents.length > 0 ? (
          <>
            <div className="admin-page-header">
              <p className="admin-page-subtitle">
                Review and approve or reject event submissions
              </p>
            </div>

            <div className="admin-events-grid">
              {pendingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  showStatus={true}
                  adminView={true}
                  showAdminActions={true}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="admin-empty-state">
            <CheckCircle size={64} color="#10b981" />
            <h3>All caught up!</h3>
            <p>There are no pending events to review.</p>
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
          title="Reject Event"
        >
          {selectedEvent && (
            <div className="admin-reject-modal-content">
              <p className="admin-modal-text">
                Are you sure you want to reject <strong>{selectedEvent.title}</strong>?
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
                  placeholder="Please provide a reason for rejection..."
                  required
                />
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
                  disabled={!rejectReason.trim()}
                >
                  Reject Event
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

