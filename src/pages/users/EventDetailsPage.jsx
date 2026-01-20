import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Mail, 
  Phone, 
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Image
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import PublicLayout from '../../components/common/PublicLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { useEventStore } from '../../store/useEventStore';
import { useRSVPStore } from '../../store/useRSVPStore';
import { useAuthStore, useIsAdmin } from '../../store/useAuthStore';
import '../../css/users/EventDetailsPage.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { 
    selectedEvent, 
    loading, 
    fetchEventById,
    deleteEvent 
  } = useEventStore();
  
  const {
    loading: rsvpLoading,
    addRSVP,
    removeRSVP,
    checkRSVPStatus
  } = useRSVPStore();

  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelRSVPModal, setShowCancelRSVPModal] = useState(false);
  const [rsvpData, setRsvpData] = useState({
    numberOfGuests: 0,
    dietaryPreferences: '',
  });

  const checkRSVP = useCallback(async () => {
    if (selectedEvent && isAuthenticated) {
      const result = await checkRSVPStatus(selectedEvent._id);
      setHasRSVPed(result.hasRSVPed);
      setRsvpStatus(result.rsvp);
    }
  }, [selectedEvent, isAuthenticated, checkRSVPStatus]);

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  useEffect(() => {
    if (selectedEvent && isAuthenticated) {
      checkRSVP();
    }
  }, [selectedEvent, isAuthenticated, checkRSVP]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleRSVP = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (hasRSVPed) {
      setShowCancelRSVPModal(true);
    } else {
      setShowRSVPModal(true);
    }
  };

  const handleCancelRSVP = async () => {
    const success = await removeRSVP(selectedEvent._id);
    if (success) {
      setHasRSVPed(false);
      setRsvpStatus(null);
      setShowCancelRSVPModal(false);
      fetchEventById(id);
    }
  };

  const handleRSVPSubmit = async () => {
    const success = await addRSVP(selectedEvent._id, rsvpData);
    if (success) {
      setShowRSVPModal(false);
      setRsvpData({ numberOfGuests: 0, dietaryPreferences: '' });
      await checkRSVP();
      fetchEventById(id);
    }
  };

  const handleDelete = async () => {
    const success = await deleteEvent(selectedEvent._id);
    if (success) {
      navigate('/events/my-events');
    }
  };

  const isOwner = selectedEvent && user && 
    (typeof selectedEvent.createdBy === 'string' 
      ? selectedEvent.createdBy === user._id 
      : selectedEvent.createdBy._id === user._id);

  const isPastEvent = selectedEvent && new Date(`${selectedEvent.date}T${selectedEvent.time || '00:00'}`) < new Date();
  const isFull = selectedEvent && selectedEvent.currentAttendees >= selectedEvent.capacity;

  const Layout = isAuthenticated ? DashboardLayout : PublicLayout;

  if (loading) {
    return (
      <Layout title="Event Details">
        <Spinner />
      </Layout>
    );
  }

  if (!selectedEvent) {
    return (
      <Layout title="Event Not Found">
        <div className="event-not-found">
          <h2>Event not found</h2>
          <Link to="/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={isAuthenticated ? "Event Details" : undefined}>
      <div className="event-details-page">
        <Link to="/events" className="back-link">
          <ArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="event-header-image">
          {selectedEvent.imageUrl ? (
            <img src={selectedEvent.imageUrl} alt={selectedEvent.title} />
          ) : (
            <div className="event-header-image-placeholder">
              <Image size={64} />
              <span>No Image Available</span>
            </div>
          )}
        </div>

        <div className="event-details-content">
          <div className="event-main">
            <div className="event-header">
              <div>
                <span className={`status-badge status-${selectedEvent.status}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
                <span className="category-badge">
                  {selectedEvent.category}
                </span>
              </div>
              {isOwner && (
                <div className="owner-actions">
                  <Link 
                    to={`/events/${selectedEvent._id}/edit`}
                    className="btn-icon"
                  >
                    <Edit size={18} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-icon delete"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <h1 className="event-title">{selectedEvent.title}</h1>

            <div className="event-info-grid">
              <div className="info-item">
                <Calendar className="info-icon" size={20} />
                <div>
                  <span className="info-label">Date</span>
                  <span className="info-value">{formatDate(selectedEvent.date)}</span>
                </div>
              </div>

              {selectedEvent.time && (
                <div className="info-item">
                  <Clock className="info-icon" size={20} />
                  <div>
                    <span className="info-label">Time</span>
                    <span className="info-value">{formatTime(selectedEvent.time)}</span>
                  </div>
                </div>
              )}

              <div className="info-item">
                <MapPin className="info-icon" size={20} />
                <div>
                  <span className="info-label">Location</span>
                  <span className="info-value">{selectedEvent.location}</span>
                </div>
              </div>

              <div className="info-item">
                <Users className="info-icon" size={20} />
                <div>
                  <span className="info-label">Attendees</span>
                  <span className="info-value">
                    {selectedEvent.currentAttendees || 0} / {selectedEvent.capacity}
                  </span>
                </div>
              </div>
            </div>

            <div className="event-description">
              <h2>About this event</h2>
              <p>{selectedEvent.description}</p>
            </div>

            <div className="event-contact">
              <h3>Contact Information</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail size={18} />
                  <span>{selectedEvent.contactEmail}</span>
                </div>
                {selectedEvent.contactPhone && (
                  <div className="contact-item">
                    <Phone size={18} />
                    <span>{selectedEvent.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="event-sidebar">
            {isAdmin ? (
              <div className="rsvp-card">
                <div className="rsvp-disabled">
                  <p>Administrators cannot RSVP to events</p>
                </div>
                <div className="event-capacity-bar">
                  <div className="capacity-fill" style={{ 
                    width: `${Math.min((selectedEvent.currentAttendees / selectedEvent.capacity) * 100, 100)}%` 
                  }} />
                </div>
                <p className="capacity-text">
                  {selectedEvent.capacity - (selectedEvent.currentAttendees || 0)} spots remaining
                </p>
              </div>
            ) : (
              <div className="rsvp-card">
                {isPastEvent ? (
                  <div className="rsvp-disabled">
                    <p>This event has already ended</p>
                  </div>
                ) : isFull ? (
                  <div className="rsvp-disabled">
                    <p>This event is full</p>
                  </div>
                ) : selectedEvent.status !== 'approved' ? (
                  <div className="rsvp-disabled">
                    <p>This event is not available for RSVP</p>
                  </div>
                ) : (
                  <>
                    {hasRSVPed ? (
                      <div className="rsvp-confirmed">
                        <CheckCircle size={24} color="#10b981" />
                        <h3>You're attending!</h3>
                        {rsvpStatus?.numberOfGuests > 0 && (
                          <p>Guests: {rsvpStatus.numberOfGuests}</p>
                        )}
                        <button
                          onClick={handleRSVP}
                          className="btn-cancel-rsvp"
                          disabled={rsvpLoading}
                        >
                          <XCircle size={16} />
                          Cancel RSVP
                        </button>
                      </div>
                    ) : (
                      <div className="rsvp-form">
                        <h3>RSVP to this event</h3>
                        <p className="rsvp-subtitle">
                          Join {selectedEvent.currentAttendees || 0} other attendees
                        </p>
                        {!isAuthenticated ? (
                          <Link to="/login" className="btn-rsvp">
                            Login to RSVP
                          </Link>
                        ) : (
                          <button
                            onClick={handleRSVP}
                            className="btn-rsvp"
                            disabled={rsvpLoading}
                          >
                            {rsvpLoading ? 'Processing...' : 'RSVP Now'}
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="event-capacity-bar">
                  <div className="capacity-fill" style={{ 
                    width: `${Math.min((selectedEvent.currentAttendees / selectedEvent.capacity) * 100, 100)}%` 
                  }} />
                </div>
                <p className="capacity-text">
                  {selectedEvent.capacity - (selectedEvent.currentAttendees || 0)} spots remaining
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RSVP Modal */}
        <Modal
          isOpen={showRSVPModal}
          onClose={() => setShowRSVPModal(false)}
          title="RSVP to Event"
        >
          <div className="rsvp-modal-content">
            <div className="form-group">
              <label htmlFor="guests" className="form-label">
                Number of Guests
              </label>
              <input
                type="number"
                id="guests"
                min="0"
                max="5"
                value={rsvpData.numberOfGuests}
                onChange={(e) => setRsvpData({ ...rsvpData, numberOfGuests: parseInt(e.target.value) || 0 })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dietary" className="form-label">
                Dietary Preferences (Optional)
              </label>
              <textarea
                id="dietary"
                rows={3}
                value={rsvpData.dietaryPreferences}
                onChange={(e) => setRsvpData({ ...rsvpData, dietaryPreferences: e.target.value })}
                className="form-textarea"
                placeholder="Any dietary restrictions or preferences..."
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowRSVPModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleRSVPSubmit}
                className="btn-primary"
                disabled={rsvpLoading}
              >
                Confirm RSVP
              </button>
            </div>
          </div>
        </Modal>

        {/* Cancel RSVP Modal */}
        <Modal
          isOpen={showCancelRSVPModal}
          onClose={() => setShowCancelRSVPModal(false)}
          title="Cancel RSVP"
        >
          <div className="cancel-rsvp-modal">
            <p>
              Are you sure you want to cancel your RSVP for{' '}
              <strong>{selectedEvent?.title}</strong>?
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowCancelRSVPModal(false)}
                className="btn-cancel"
              >
                Keep RSVP
              </button>
              <button
                onClick={handleCancelRSVP}
                className="btn-confirm-cancel"
                disabled={rsvpLoading}
              >
                Yes, Cancel RSVP
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Event"
        >
          <div className="delete-modal-content">
            <p>Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-delete"
              >
                Delete Event
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;

