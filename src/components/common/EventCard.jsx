import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, CheckCircle, Image, XCircle, PlayCircle } from 'lucide-react';
import { useRSVPStore } from '../../store/useRSVPStore';
import { useAuthStore, useIsAdmin } from '../../store/useAuthStore';
import { useEventStore } from '../../store/useEventStore';
import { AlertCircle } from 'lucide-react';
import '../../css/users/EventCard.css';

const EventCard = ({ event, showActions = false, onDelete, onEdit, showStatus = true, onEventUpdate, skipRSVPCheck = false, adminView = false, showCancelRSVP = false, onCancelRSVP, numberOfGuests = 0, showAdminActions = false, onApprove, onReject }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const isAdmin = useIsAdmin();
  const { addRSVP, checkRSVPStatus, loading: rsvpLoading } = useRSVPStore();
  const { fetchEvents } = useEventStore();
  const [hasRSVPed, setHasRSVPed] = useState(skipRSVPCheck);
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

  // Parse date string helper
  const parseDateString = useCallback((dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (typeof dateValue === 'string') {
      return dateValue.split('T')[0].split(' ')[0];
    }
    return null;
  }, []);

  const isPastEvent = useMemo(() => {
    // Use status field - if event is completed, it's past
    if (event.status === 'completed') return true;
    
    // If status is cancelled, treat as past
    if (event.status === 'cancelled') return true;
    
    // Check end date/time if available
    if (event.endDate && event.endTime) {
      const endDateStr = parseDateString(event.endDate);
      if (endDateStr) {
        const endDateTime = new Date(`${endDateStr}T${event.endTime}`);
        const now = new Date();
        return endDateTime < now;
      }
    }
    
    // Fallback to start date/time if end date/time not available
    if (event.date) {
      const startDateStr = parseDateString(event.date);
      if (startDateStr) {
        const startDateTime = new Date(`${startDateStr}T${event.time || '00:00'}`);
        const now = new Date();
        return startDateTime < now;
      }
    }
    
    return false;
  }, [event.date, event.time, event.endDate, event.endTime, event.status, parseDateString]);

  const isOngoingEvent = useMemo(() => {
    // Only check if event is approved (not pending, rejected, cancelled, or completed)
    if (event.status !== 'approved') return false;
    
    // Can't be ongoing if it's past
    if (isPastEvent) return false;
    
    const now = new Date();
    
    // Check if event has started
    if (event.date && event.time) {
      const startDateStr = parseDateString(event.date);
      if (startDateStr) {
        const startDateTime = new Date(`${startDateStr}T${event.time}`);
        
        // Check if event has ended
        if (event.endDate && event.endTime) {
          const endDateStr = parseDateString(event.endDate);
          if (endDateStr) {
            const endDateTime = new Date(`${endDateStr}T${event.endTime}`);
            // Event is ongoing if current time is between start and end
            return startDateTime <= now && now <= endDateTime;
          }
        }
        
        // If no end time, consider ongoing if start time has passed and status is approved
        return startDateTime <= now;
      }
    }
    
    return false;
  }, [event.date, event.time, event.endDate, event.endTime, event.status, isPastEvent, parseDateString]);
  
  const isFull = useMemo(() => {
    return event.currentAttendees >= event.capacity;
  }, [event.currentAttendees, event.capacity]);
  
  const canRSVP = useMemo(() => {
    return !isPastEvent && !isOngoingEvent && event.status === 'approved' && !isFull;
  }, [isPastEvent, isOngoingEvent, event.status, isFull]);

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
            {event.status && (
              <span className={`status-badge ${getStatusBadgeClass(event.status)}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            )}
            {event.category && (
              <span 
                className="category-badge"
                style={{ backgroundColor: getCategoryColor(event.category) }}
              >
                {event.category}
              </span>
            )}
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
            <span>
              {event.endDate && event.endDate !== event.date
                ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                : formatDate(event.date)
              }
            </span>
          </div>

          {event.time && (
            <div className="event-info-item">
              <Clock className="info-icon" size={16} />
              <span>
                {event.endTime && event.endTime !== event.time
                  ? `${formatTime(event.time)} - ${formatTime(event.endTime)}`
                  : formatTime(event.time)
                }
              </span>
            </div>
          )}

          <div className="event-info-item">
            {event.isOnline ? (
              isPastEvent ? (
                // Show meeting URL only for past online events
                event.location && event.location.startsWith('http') ? (
                  <a
                    href={event.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meeting-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlayCircle className="info-icon" size={16} />
                    <span>Join Meeting</span>
                  </a>
                ) : (
                  <>
                    <PlayCircle className="info-icon" size={16} />
                    <span>Online Event</span>
                  </>
                )
              ) : (
                <>
                  <PlayCircle className="info-icon" size={16} />
                  <span>Online Event</span>
                </>
              )
            ) : (
              <>
                <MapPin className="info-icon" size={16} />
                <span>{event.location}</span>
              </>
            )}
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
            {showCancelRSVP && onCancelRSVP ? (
              <>
                {numberOfGuests > 0 && (
                  <div className="rsvp-guests-info">
                    <Users size={14} />
                    <span><strong>{numberOfGuests}</strong> guest{numberOfGuests !== 1 ? 's' : ''}</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelRSVP();
                  }}
                  className="event-card-cancel-rsvp-btn"
                >
                  <XCircle size={16} />
                  Cancel RSVP
                </button>
                <Link 
                  to={adminView ? `/admin/events/${event._id}` : `/events/${event._id}`}
                  className="event-card-view-btn"
                >
                  View Details
                </Link>
              </>
            ) : (
              <>
                {isPastEvent ? (
                  <div className="event-card-past-label">
                    <Clock size={16} />
                    <span>Past Event</span>
                  </div>
                ) : isOngoingEvent ? (
                  <div className="event-card-ongoing-label">
                    <PlayCircle size={16} />
                    <span>Ongoing Event</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
                <Link 
                  to={adminView ? `/admin/events/${event._id}` : `/events/${event._id}`}
                  className={`event-card-view-btn ${isPastEvent || isOngoingEvent ? 'full-width' : ''}`}
                >
                  View Details
                </Link>
              </>
            )}

            {/* Admin Actions - Only show for admins when event is pending */}
            {isAdmin && event.status === 'pending' && showAdminActions && (
              <div className="admin-card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove?.(event._id);
                  }}
                  className="admin-btn-approve"
                  disabled={rsvpLoading}
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject?.(event._id);
                  }}
                  className="admin-btn-reject"
                  disabled={rsvpLoading}
                >
                  <AlertCircle size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;

