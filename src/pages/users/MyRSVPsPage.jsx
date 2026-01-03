import React, { useEffect, useState, useMemo } from 'react';
import { Clock, XCircle, Users, CheckCircle, CalendarCheck, Filter, AlertCircle, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import Modal from '../../components/common/Modal';
import { useRSVPStore } from '../../store/useRSVPStore';
import { Link } from 'react-router-dom';
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
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    // Fetch all RSVPs (both upcoming and past) by not specifying status
    // The backend will return all, and we'll filter on the frontend
    fetchUserRSVPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  // Helper function to parse event date correctly
  const parseEventDateTime = (event) => {
    if (!event || !event.date) return null;
    
    let eventDate = event.date;
    
    // Handle Date object
    if (eventDate instanceof Date) {
      const year = eventDate.getFullYear();
      const month = String(eventDate.getMonth() + 1).padStart(2, '0');
      const day = String(eventDate.getDate()).padStart(2, '0');
      eventDate = `${year}-${month}-${day}`;
    } 
    // Handle string date
    else if (typeof eventDate === 'string') {
      // Extract just the date part (YYYY-MM-DD)
      eventDate = eventDate.split('T')[0].split(' ')[0];
    }
    
    // Combine with time
    const time = event.time || '00:00';
    const eventDateTime = new Date(`${eventDate}T${time}`);
    
    if (isNaN(eventDateTime.getTime())) {
      console.error('[MyRSVPsPage] Invalid date created:', { 
        eventId: event._id, 
        originalDate: event.date, 
        formattedDate: eventDate, 
        time: event.time 
      });
      return null;
    }
    
    return eventDateTime;
  };

  const upcomingRSVPs = rsvps.filter(rsvp => {
    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
    if (!event) return false;
    const eventDateTime = parseEventDateTime(event);
    if (!eventDateTime) return false;
    
    const now = new Date();
    return eventDateTime > now;
  });

  const pastRSVPs = rsvps.filter(rsvp => {
    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
    if (!event) return false;
    const eventDateTime = parseEventDateTime(event);
    if (!eventDateTime) return false;
    
    const now = new Date();
    return eventDateTime < now;
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalGuests = rsvps.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0);
    const upcomingGuests = upcomingRSVPs.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 0), 0);
    
    return {
      total: rsvps.length,
      upcoming: upcomingRSVPs.length,
      past: pastRSVPs.length,
      totalGuests,
      upcomingGuests,
    };
  }, [rsvps, upcomingRSVPs, pastRSVPs]);

  // Filter RSVPs based on active tab
  const displayedRSVPs = useMemo(() => {
    if (filterTab === 'upcoming') return upcomingRSVPs;
    if (filterTab === 'past') return pastRSVPs;
    return rsvps;
  }, [filterTab, upcomingRSVPs, pastRSVPs, rsvps]);

  const handleCancelRSVP = async () => {
    if (rsvpToCancel) {
      const eventId = typeof rsvpToCancel.event === 'string' 
        ? rsvpToCancel.event 
        : rsvpToCancel.event._id;
      const success = await removeRSVP(eventId);
      if (success) {
        setShowCancelModal(false);
        setRsvpToCancel(null);
        fetchUserRSVPs({ status: 'upcoming' });
      }
    }
  };

  const openCancelModal = (rsvp) => {
    setRsvpToCancel(rsvp);
    setShowCancelModal(true);
  };

  return (
    <DashboardLayout title="My RSVPs">
      <div className="my-rsvps-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">My RSVPs</h1>
            <p className="page-subtitle">Manage events you're attending or have attended</p>
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && rsvps.length > 0 && (
          <div className="rsvp-stats">
            <div className="stat-card-mini stat-total">
              <div className="stat-mini-icon">
                <CalendarCheck size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.total}</div>
                <div className="stat-mini-label">Total RSVPs</div>
              </div>
            </div>
            <div className="stat-card-mini stat-upcoming">
              <div className="stat-mini-icon">
                <Clock size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.upcoming}</div>
                <div className="stat-mini-label">Upcoming</div>
              </div>
            </div>
            <div className="stat-card-mini stat-past">
              <div className="stat-mini-icon">
                <CheckCircle size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.past}</div>
                <div className="stat-mini-label">Past</div>
              </div>
            </div>
            <div className="stat-card-mini stat-guests">
              <div className="stat-mini-icon">
                <Users size={20} />
              </div>
              <div className="stat-mini-content">
                <div className="stat-mini-value">{stats.totalGuests}</div>
                <div className="stat-mini-label">Total Guests</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && rsvps.length > 0 && (
          <div className="filter-tabs">
            <button
              onClick={() => setFilterTab('all')}
              className={`filter-tab ${filterTab === 'all' ? 'active' : ''}`}
            >
              <CalendarCheck size={16} />
              All RSVPs
              {stats.total > 0 && <span className="tab-count">{stats.total}</span>}
            </button>
            <button
              onClick={() => setFilterTab('upcoming')}
              className={`filter-tab ${filterTab === 'upcoming' ? 'active' : ''}`}
            >
              <Clock size={16} />
              Upcoming
              {stats.upcoming > 0 && <span className="tab-count">{stats.upcoming}</span>}
            </button>
            <button
              onClick={() => setFilterTab('past')}
              className={`filter-tab ${filterTab === 'past' ? 'active' : ''}`}
            >
              <CheckCircle size={16} />
              Past
              {stats.past > 0 && <span className="tab-count">{stats.past}</span>}
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && displayedRSVPs.length > 0 && (
          <div className="results-header">
            <div className="results-info">
              <p className="results-count">
                <span className="count-number">{displayedRSVPs.length}</span>
                <span className="count-label"> RSVP{displayedRSVPs.length !== 1 ? 's' : ''}</span>
                {filterTab !== 'all' && (
                  <span className="filter-indicator">
                    <Filter size={14} />
                    {filterTab === 'upcoming' ? 'Upcoming' : 'Past'}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="events-loading">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : displayedRSVPs.length > 0 ? (
          <div className="events-grid">
            {displayedRSVPs.map((rsvp) => {
              const event = typeof rsvp.event === 'string' ? null : rsvp.event;
              if (!event) return null;
              
              const eventDateTime = parseEventDateTime(event);
              const isPast = eventDateTime ? eventDateTime < new Date() : false;
              
              return (
                <div key={rsvp._id} className={`rsvp-card-wrapper ${isPast ? 'past-event' : ''}`}>
                  <EventCard 
                    event={event} 
                    showStatus={false} 
                    skipRSVPCheck={true}
                    showCancelRSVP={!isPast}
                    onCancelRSVP={() => openCancelModal(rsvp)}
                    numberOfGuests={rsvp.numberOfGuests || 0}
                  />
                  {isPast && rsvp.numberOfGuests > 0 && (
                    <div className="rsvp-past-info">
                      <Users size={14} />
                      <span>Attended with <strong>{rsvp.numberOfGuests}</strong> guest{rsvp.numberOfGuests !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              {filterTab === 'all' ? (
                <CalendarCheck size={64} />
              ) : filterTab === 'upcoming' ? (
                <Clock size={64} />
              ) : (
                <CheckCircle size={64} />
              )}
              <div className="empty-state-glow"></div>
            </div>
            <h3 className="empty-state-title">
              {filterTab === 'all'
                ? "You haven't RSVP'd to any events yet"
                : filterTab === 'upcoming'
                ? 'No upcoming RSVPs'
                : 'No past RSVPs'}
            </h3>
            <p className="empty-state-text">
              {filterTab === 'all'
                ? "Start exploring events and RSVP to attend amazing campus activities!"
                : filterTab === 'upcoming'
                ? "You don't have any upcoming events at the moment."
                : "You haven't attended any events yet."}
            </p>
            <div className="empty-state-actions">
              <Link to="/events" className="btn-primary">
                <Sparkles size={18} />
                Browse Events
              </Link>
              {filterTab !== 'all' && (
                <button
                  onClick={() => setFilterTab('all')}
                  className="btn-secondary"
                >
                  View All RSVPs
                </button>
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
        >
          {rsvpToCancel && (
            <div className="cancel-rsvp-modal">
              <div className="cancel-warning">
                <AlertCircle size={48} color="#ef4444" />
                <p>
                  Are you sure you want to cancel your RSVP for{' '}
                  <strong>
                    {typeof rsvpToCancel.event === 'string' 
                      ? 'this event' 
                      : rsvpToCancel.event.title}
                  </strong>?
                </p>
                <p className="warning-text">
                  This action cannot be undone. You'll need to RSVP again if you change your mind.
                </p>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setRsvpToCancel(null);
                  }}
                  className="btn-cancel"
                >
                  Keep RSVP
                </button>
                <button
                  onClick={handleCancelRSVP}
                  className="btn-confirm-cancel"
                  disabled={loading}
                >
                  <XCircle size={18} />
                  Yes, Cancel RSVP
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

