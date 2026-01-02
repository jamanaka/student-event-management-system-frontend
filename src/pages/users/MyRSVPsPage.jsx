import React, { useEffect } from 'react';
import { Clock, Calendar, XCircle } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { useRSVPStore } from '../../store/useRSVPStore';
import '../../css/users/MyRSVPsPage.css';

const MyRSVPsPage = () => {
  const {
    rsvps,
    loading,
    fetchUserRSVPs,
    removeRSVP
  } = useRSVPStore();

  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [rsvpToCancel, setRsvpToCancel] = React.useState(null);

  useEffect(() => {
    console.log('[MyRSVPsPage] Component mounted, fetching RSVPs');
    // Fetch all RSVPs (both upcoming and past) by not specifying status
    // The backend will return all, and we'll filter on the frontend
    fetchUserRSVPs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch once on mount

  useEffect(() => {
    console.log('[MyRSVPsPage] RSVPs state changed:', {
      rsvpsCount: rsvps.length,
      loading,
      rsvps: rsvps.map(r => ({
        id: r._id,
        eventId: typeof r.event === 'string' ? r.event : r.event?._id,
        eventTitle: typeof r.event === 'string' ? 'STRING' : r.event?.title,
        hasEvent: !!r.event,
        numberOfGuests: r.numberOfGuests
      }))
    });
  }, [rsvps, loading]);

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
    if (!event) {
      console.log('[MyRSVPsPage] Filtering out RSVP with no event:', rsvp._id);
      return false;
    }
    const eventDateTime = parseEventDateTime(event);
    if (!eventDateTime) return false;
    
    const now = new Date();
    const isUpcoming = eventDateTime > now;
    console.log('[MyRSVPsPage] Upcoming filter:', { 
      rsvpId: rsvp._id, 
      eventTitle: event.title, 
      eventDateTime, 
      now, 
      isUpcoming 
    });
    return isUpcoming;
  });

  const pastRSVPs = rsvps.filter(rsvp => {
    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
    if (!event) {
      console.log('[MyRSVPsPage] Filtering out RSVP with no event (past):', rsvp._id);
      return false;
    }
    const eventDateTime = parseEventDateTime(event);
    if (!eventDateTime) return false;
    
    const now = new Date();
    const isPast = eventDateTime < now;
    console.log('[MyRSVPsPage] Past filter:', { 
      rsvpId: rsvp._id, 
      eventTitle: event.title, 
      eventDateTime, 
      now, 
      isPast 
    });
    return isPast;
  });

  console.log('[MyRSVPsPage] Filtered results:', {
    upcomingCount: upcomingRSVPs.length,
    pastCount: pastRSVPs.length,
    totalRSVPs: rsvps.length
  });

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
        <div className="page-header">
          <h1>My RSVPs</h1>
          <p>Events you're attending or have attended</p>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <>
            {upcomingRSVPs.length > 0 && (
              <section className="rsvp-section">
                <div className="section-header">
                  <Clock size={24} color="#3b82f6" />
                  <h2>Upcoming Events ({upcomingRSVPs.length})</h2>
                </div>
                <div className="events-grid">
                  {upcomingRSVPs.map((rsvp) => {
                    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
                    if (!event) return null;
                    return (
                      <div key={rsvp._id} className="rsvp-card-wrapper">
                        <EventCard event={event} showStatus={false} skipRSVPCheck={true} />
                        <div className="rsvp-actions">
                          {rsvp.numberOfGuests > 0 && (
                            <div className="rsvp-details">
                              <p><strong>Guests:</strong> {rsvp.numberOfGuests}</p>
                            </div>
                          )}
                          <button
                            onClick={() => openCancelModal(rsvp)}
                            className="btn-cancel-rsvp"
                          >
                            <XCircle size={16} />
                            Cancel RSVP
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {pastRSVPs.length > 0 && (
              <section className="rsvp-section">
                <div className="section-header">
                  <Calendar size={24} color="#6b7280" />
                  <h2>Past Events ({pastRSVPs.length})</h2>
                </div>
                <div className="events-grid">
                  {pastRSVPs.map((rsvp) => {
                    const event = typeof rsvp.event === 'string' ? null : rsvp.event;
                    if (!event) return null;
                    return (
                      <EventCard key={rsvp._id} event={event} showStatus={false} skipRSVPCheck={true} />
                    );
                  })}
                </div>
              </section>
            )}

            {rsvps.length === 0 && (
              <div className="empty-state">
                <Calendar size={64} color="#9ca3af" />
                <h3>No RSVPs yet</h3>
                <p>Start exploring events and RSVP to attend!</p>
              </div>
            )}
          </>
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
              <p>
                Are you sure you want to cancel your RSVP for{' '}
                <strong>
                  {typeof rsvpToCancel.event === 'string' 
                    ? 'this event' 
                    : rsvpToCancel.event.title}
                </strong>?
              </p>
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

