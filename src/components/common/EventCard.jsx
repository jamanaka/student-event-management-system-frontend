import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, CheckCircle, Image } from 'lucide-react';
import { useRSVPStore } from '../../store/useRSVPStore';
import { useAuthStore, useIsAdmin } from '../../store/useAuthStore';
import { useEventStore } from '../../store/useEventStore';
import '../../css/users/EventCard.css';

const EventCard = ({ event, showActions = false, onDelete, onEdit, showStatus = true, onEventUpdate, skipRSVPCheck = false, adminView = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { addRSVP, checkRSVPStatus, loading: rsvpLoading } = useRSVPStore();
  const { fetchEvents } = useEventStore();
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [isCheckingRSVP, setIsCheckingRSVP] = useState(false);
  
  // Admins should not be able to RSVP
  const canUserRSVP = !isAdmin && !adminView;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
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

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
    };
    return statusClasses[status] || 'status-default';
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: '#3b82f6',
      social: '#ec4899',
      sports: '#10b981',
      cultural: '#f59e0b',
      career: '#8b5cf6',
      workshop: '#06b6d4',
      other: '#6b7280',
    };
    return colors[category] || colors.other;
  };

  const isPastEvent = useMemo(() => {
    return new Date(`${event.date}T${event.time || '00:00'}`) < new Date();
  }, [event.date, event.time]);
  
  const isFull = useMemo(() => {
    return event.currentAttendees >= event.capacity;
  }, [event.currentAttendees, event.capacity]);
  
  const canRSVP = useMemo(() => {
    return !isPastEvent && event.status === 'approved' && !isFull;
  }, [isPastEvent, event.status, isFull]);

  const checkUserRSVPStatus = useCallback(async () => {
    if (skipRSVPCheck) return;
    
    setIsCheckingRSVP(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        return;
      }
      const eventIdString = String(eventId);
      const result = await checkRSVPStatus(eventIdString);
      setHasRSVPed(result.hasRSVPed);
    } catch (error) {
      console.error('Error checking RSVP status:', error);
    } finally {
      setIsCheckingRSVP(false);
    }
  }, [event._id, event.id, checkRSVPStatus, skipRSVPCheck]);

  // Check RSVP status when component mounts or event changes
  // Only check if user is not an admin
  useEffect(() => {
    if (!skipRSVPCheck && isAuthenticated && canRSVP && canUserRSVP) {
      checkUserRSVPStatus();
    }
  }, [isAuthenticated, canRSVP, canUserRSVP, checkUserRSVPStatus, skipRSVPCheck]);

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // If already joined, navigate to event details instead of canceling
    if (hasRSVPed) {
      navigate(adminView ? `/admin/events/${event._id || event.id}` : `/events/${event._id || event.id}`);
      return;
    }

    // Ensure event ID is valid
    const eventId = event._id || event.id;
    if (!eventId) {
      console.error('Event ID is missing');
      return;
    }

    // Convert to string if needed
    const eventIdString = String(eventId);

    // Add RSVP (without guests for quick join)
    const success = await addRSVP(eventIdString, { numberOfGuests: 0 });
    if (success) {
      setHasRSVPed(true);
      // Refresh events if callback provided
      if (onEventUpdate) {
        onEventUpdate();
      } else {
        // Try to refresh events from store
        fetchEvents({ page: 1, limit: 12, status: 'approved', upcoming: true });
      }
    }
  };

  return (
    <div className={`event-card ${isPastEvent ? 'past-event' : ''}`}>
      <div className="event-card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} />
        ) : (
          <div className="event-card-image-placeholder">
            <Image size={48} />
            <span>No Image Available</span>
          </div>
        )}
      </div>
      
      <div className="event-card-content">
        {showStatus && (
          <div className="event-card-header">
            <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            <span 
              className="category-badge"
              style={{ backgroundColor: getCategoryColor(event.category) }}
            >
              {event.category}
            </span>
          </div>
        )}

        <Link to={adminView ? `/admin/events/${event._id}` : `/events/${event._id}`} className="event-card-title-link">
          <h3 className="event-card-title">{event.title}</h3>
        </Link>

        <p className="event-card-description">
          {event.description && event.description.length > 120 
            ? `${event.description.substring(0, 120)}...` 
            : event.description || 'No description available'}
        </p>

        <div className="event-card-info">
          <div className="event-info-item">
            <Calendar className="info-icon" size={16} />
            <span>{formatDate(event.date)}</span>
          </div>
          
          {event.time && (
            <div className="event-info-item">
              <Clock className="info-icon" size={16} />
              <span>{formatTime(event.time)}</span>
            </div>
          )}

          <div className="event-info-item">
            <MapPin className="info-icon" size={16} />
            <span>{event.location}</span>
          </div>

          <div className="event-info-item">
            <Users className="info-icon" size={16} />
            <span>{event.currentAttendees || 0} / {event.capacity} attendees</span>
          </div>
        </div>

        {showActions && (
          <div className="event-card-actions">
            <Link 
              to={`/events/${event._id}/edit`}
              className="btn-edit"
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete(event._id)}
              className="btn-delete"
            >
              Delete
            </button>
          </div>
        )}

        {!showActions && (
          <div className="event-card-footer">
            {canRSVP && canUserRSVP && isAuthenticated ? (
              <button
                onClick={handleJoinEvent}
                className={`event-card-join-btn ${hasRSVPed ? 'joined' : ''}`}
                disabled={rsvpLoading || isCheckingRSVP}
              >
                {rsvpLoading || isCheckingRSVP ? (
                  'Loading...'
                ) : hasRSVPed ? (
                  <>
                    <CheckCircle size={16} />
                    Joined
                  </>
                ) : (
                  'Join Event'
                )}
              </button>
            ) : canRSVP && canUserRSVP && !isAuthenticated ? (
              <Link 
                to="/login"
                className="event-card-join-btn"
                onClick={(e) => e.stopPropagation()}
              >
                Login to Join
              </Link>
            ) : null}
            <Link 
              to={adminView ? `/admin/events/${event._id}` : `/events/${event._id}`}
              className="event-card-view-btn"
            >
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;

