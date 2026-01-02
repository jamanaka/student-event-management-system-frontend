import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Clock, Users, TrendingUp } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import Spinner from '../../components/common/Spinner';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useEventStore } from '../../store/useEventStore';
import { useRSVPStore } from '../../store/useRSVPStore';
import '../../css/users/UserDashboard.css';

const UserDashboard = () => {
  const { 
    events, 
    userEvents,
    loading, 
    fetchEvents,
    fetchUserEvents
  } = useEventStore();
  
  const {
    rsvps,
    loading: rsvpLoading,
    fetchUserRSVPs
  } = useRSVPStore();

  const [stats, setStats] = useState({
    upcomingEvents: 0,
    myEvents: 0,
    myRSVPs: 0,
    totalAttendees: 0,
  });

  useEffect(() => {
    fetchEvents({ limit: 6, status: 'approved', sort: 'date', upcoming: true });
    fetchUserEvents('all');
    fetchUserRSVPs({ status: 'upcoming' });
  }, []);

  useEffect(() => {
    const upcoming = events.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
      return eventDate > new Date() && event.status === 'approved';
    });

    setStats({
      upcomingEvents: upcoming.length,
      myEvents: userEvents.length,
      myRSVPs: rsvps.length,
      totalAttendees: events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0),
    });
  }, [events, userEvents, rsvps]);

  const handleEventUpdate = () => {
    // Refresh events and RSVPs after RSVP
    fetchEvents({ limit: 6, status: 'approved', sort: 'date', upcoming: true });
    fetchUserRSVPs({ status: 'upcoming' });
  };

  return (
    <DashboardLayout title="My Dashboard">
      <div className="user-dashboard">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <Calendar className="icon" size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">UPCOMING EVENTS</p>
              <h3 className="stat-value">{stats.upcomingEvents}</h3>
              <p className="stat-status">Available to attend</p>
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <TrendingUp className="icon" size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">MY EVENTS</p>
              <h3 className="stat-value">{stats.myEvents}</h3>
              <p className="stat-status">Events you created</p>
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <Users className="icon" size={28} />
            </div>
            <div className="stat-content">
              <p className="stat-label">MY RSVPS</p>
              <h3 className="stat-value">{stats.myRSVPs}</h3>
              <p className="stat-status">Events you're attending</p>
            </div>
          </div>

          <div className="stat-card stat-warning highlight">
            <Link to="/events/create" className="stat-link">
              <div className="stat-icon">
                <PlusCircle className="icon" size={28} />
              </div>
              <div className="stat-content">
                <p className="stat-label">CREATE EVENT</p>
                <h3 className="stat-value">+</h3>
                <p className="stat-status">Start organizing now</p>
              </div>
            </Link>
          </div>
        </div>

        {/* My Events Section */}
        {userEvents.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Calendar size={24} style={{ marginRight: '8px', color: '#3b82f6' }} />
                  My Events ({userEvents.length})
                </h2>
                <p className="section-subtitle">Events you've created</p>
              </div>
              <Link to="/events/my-events" className="btn-view-all">
                View All
              </Link>
            </div>

            {loading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <div className="events-grid">
                {userEvents.slice(0, 3).map((event) => (
                  <EventCard key={event._id} event={event} showStatus={true} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* My RSVPs Section */}
        {rsvps.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  <Users size={24} style={{ marginRight: '8px', color: '#10b981' }} />
                  My RSVPs ({rsvps.length})
                </h2>
                <p className="section-subtitle">Events you're attending</p>
              </div>
              <Link to="/events/my-rsvps" className="btn-view-all">
                View All
              </Link>
            </div>

            {rsvpLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <div className="events-grid">
                {rsvps.slice(0, 3).map((rsvp) => {
                  const event = typeof rsvp.event === 'string' ? null : rsvp.event;
                  if (!event) return null;
                  return (
                    <EventCard key={rsvp._id} event={event} showStatus={true} skipRSVPCheck={true} />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Upcoming Events Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Clock size={24} style={{ marginRight: '8px', color: '#667eea' }} />
                Upcoming Events
              </h2>
              <p className="section-subtitle">Discover exciting events happening soon</p>
            </div>
            <Link to="/events" className="btn-view-all">
              Browse All
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard 
                  key={event._id} 
                  event={event} 
                  showStatus={false}
                  onEventUpdate={handleEventUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Calendar size={64} color="#cbd5e1" />
              </div>
              <h3 className="empty-state-title">No upcoming events found</h3>
              <p>Start creating amazing events for your campus community!</p>
              <Link to="/events/create" className="btn-primary">
                Create Your First Event
              </Link>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
