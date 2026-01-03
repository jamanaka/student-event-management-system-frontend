import React, { useEffect, useState } from 'react';
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
  Image
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { useEventStore } from '../../store/useEventStore';
import '../../css/users/EventDetailsPage.css';

const AdminEventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    selectedEvent, 
    loading, 
    fetchEventById,
    deleteEvent 
  } = useEventStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id]);

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

  const handleDelete = async () => {
    const success = await deleteEvent(selectedEvent._id);
    if (success) {
      navigate('/admin/events');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Event Details" isAdmin={true}>
        <Spinner />
      </DashboardLayout>
    );
  }

  if (!selectedEvent) {
    return (
      <DashboardLayout title="Event Not Found" isAdmin={true}>
        <div className="event-not-found">
          <h2>Event not found</h2>
          <Link to="/admin/events" className="btn-primary">
            Back to Events
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Event Details" isAdmin={true}>
      <div className="event-details-page">
        <Link to="/admin/events" className="back-link">
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
        </div>

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
    </DashboardLayout>
  );
};

export default AdminEventDetailsPage;
