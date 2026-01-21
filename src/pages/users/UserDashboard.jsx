import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Users, TrendingUp, CheckCircle, AlertCircle, Sparkles, ArrowUpRight, Zap, Award, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useEventStore } from '../../store/useEventStore';
import { useRSVPStore } from '../../store/useRSVPStore';
import { useAuthStore } from '../../store/useAuthStore';
import '../../css/users/UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuthStore();
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
    myEventsApproved: 0,
    myEventsPending: 0,
    myRSVPs: 0,
    upcomingRSVPs: 0,
    totalAttendees: 0,
    totalAttendeesMyEvents: 0,
    totalCategories: 0,
    engagementScore: 0
  });

  const [quickFilters, setQuickFilters] = useState('all');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchEvents({ limit: 6, status: 'approved', sort: 'date', upcoming: true });
    fetchUserEvents('all');
    fetchUserRSVPs({ status: 'upcoming' });
  }, [fetchEvents, fetchUserEvents, fetchUserRSVPs]);

  useEffect(() => {
    const upcoming = events.filter(event => {
      const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);
      return eventDate > new Date() && event.status === 'approved';
    });

    const approvedEvents = userEvents.filter(e => e.status === 'approved').length;
    const pendingEvents = userEvents.filter(e => e.status === 'pending').length;
    const upcomingRSVPs = rsvps.filter(rsvp => {
      const event = rsvp.event;
      const eventDate = new Date(`${event?.date}T${event?.time || '00:00'}`);
      return eventDate > new Date();
    }).length;

    const categories = new Set(events.map(e => e.category)).size;
    const engagementScore = Math.min(
      100,
      rsvps.length * 20 + userEvents.length * 15 + events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0)
    );

    setStats({
      upcomingEvents: upcoming.length,
      myEvents: userEvents.length,
      myEventsApproved: approvedEvents,
      myEventsPending: pendingEvents,
      myRSVPs: rsvps.length,
      upcomingRSVPs,
      totalAttendees: events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0),
      totalAttendeesMyEvents: userEvents.reduce((sum, event) => sum + (event.currentAttendees || 0), 0),
      totalCategories: categories,
      engagementScore
    });
  }, [events, userEvents, rsvps]);

  const handleEventUpdate = () => {
    fetchEvents({ limit: 6, status: 'approved', sort: 'date', upcoming: true });
    fetchUserRSVPs({ status: 'upcoming' });
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (quickFilters) {
      case 'today':
        return events.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === now.toDateString();
        });
      case 'week':
        return events.filter(event => {
          const eventDate = new Date(event.date);
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return eventDate <= weekFromNow;
        });
      case 'popular':
        return [...events].sort((a, b) => (b.currentAttendees || 0) - (a.currentAttendees || 0));
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <DashboardLayout title="My Dashboard">
      <div className="user-dashboard">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-badge">
              <Sparkles size={16} />
              <span>{greeting}, {user?.firstName || 'there'}!</span>
            </div>
            <h1 className="welcome-title">Your Event Dashboard</h1>
            <p className="welcome-subtitle">
              Track, manage, and discover amazing events happening around you
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/events" className="welcome-action-btn">
              <ExternalLink size={18} />
              Explore Events
            </Link>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="stats-grid">
          <div className="stat-card stat-primary">
            <div className="stat-icon">
              <Calendar className="icon" />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-content">
              <p className="stat-label">UPCOMING EVENTS</p>
              <div className="stat-value-container">
                <h3 className="stat-value">{stats.upcomingEvents}</h3>
                <span className="stat-trend">+{Math.floor(stats.upcomingEvents * 0.2)} this week</span>
              </div>
              <p className="stat-status">Available to attend</p>
              {stats.upcomingEvents > 0 && (
                <Link to="/events" className="stat-action">
                  Browse Events <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>

          <div className="stat-card stat-success">
            <div className="stat-icon">
              <TrendingUp className="icon" />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-content">
              <p className="stat-label">MY EVENTS</p>
              <div className="stat-value-container">
                <h3 className="stat-value">{stats.myEvents}</h3>
                <div className="stat-badges">
                  <span className="stat-badge approved">
                    <CheckCircle size={12} />
                    {stats.myEventsApproved}
                  </span>
                  {stats.myEventsPending > 0 && (
                    <span className="stat-badge pending">
                      <AlertCircle size={12} />
                      {stats.myEventsPending}
                    </span>
                  )}
                </div>
              </div>
              <p className="stat-status">{stats.totalAttendeesMyEvents} total attendees</p>
              {stats.myEvents > 0 && (
                <Link to="/events/my-events" className="stat-action">
                  View Events <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>

          <div className="stat-card stat-info">
            <div className="stat-icon">
              <Users className="icon" />
              <div className="stat-icon-glow"></div>
            </div>
            <div className="stat-content">
              <p className="stat-label">MY RSVPS</p>
              <div className="stat-value-container">
                <h3 className="stat-value">{stats.myRSVPs}</h3>
                <span className="stat-trend">{stats.upcomingRSVPs} upcoming</span>
              </div>
              <p className="stat-status">Active participation</p>
              {stats.myRSVPs > 0 && (
                <Link to="/events/my-rsvps" className="stat-action">
                  View RSVPs <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>

          <div className="stat-card stat-accent create-event-card">
            <Link to="/events/create" className="stat-link">
              <div className="stat-icon">
                <PlusCircle className="icon" />
                <div className="stat-icon-glow"></div>
              </div>
              <div className="stat-content">
                <p className="stat-label">CREATE EVENT</p>
                <h3 className="stat-value">+ New</h3>
                <p className="stat-status">Start organizing now</p>
                <div className="stat-action-btn">
                  <Sparkles size={16} />
                  Get Started
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="dashboard-filters">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${quickFilters === 'all' ? 'active' : ''}`}
              onClick={() => setQuickFilters('all')}
            >
              All Events
            </button>
            <button 
              className={`filter-tab ${quickFilters === 'today' ? 'active' : ''}`}
              onClick={() => setQuickFilters('today')}
            >
              Today
            </button>
            <button 
              className={`filter-tab ${quickFilters === 'week' ? 'active' : ''}`}
              onClick={() => setQuickFilters('week')}
            >
              This Week
            </button>
            {/* <button 
              className={`filter-tab ${quickFilters === 'popular' ? 'active' : ''}`}
              onClick={() => setQuickFilters('popular')}
            >
              Most Popular
            </button> */}
          </div>
          <div className="filter-stats">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        </div>

        {/* My Events Section */}
        {userEvents.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <div className="section-header-left">
                <div className="section-icon">
                  <Calendar size={28} />
                </div>
                <div>
                  <h2 className="section-title">My Events</h2>
                  <p className="section-subtitle">Events you've created</p>
                </div>
              </div>
              <Link to="/events/my-events" className="btn-view-all">
                View All <ArrowUpRight size={16} />
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
              <div className="section-header-left">
                <div className="section-icon">
                  <Award size={28} />
                </div>
                <div>
                  <h2 className="section-title">My RSVPs</h2>
                  <p className="section-subtitle">Events you're attending</p>
                </div>
              </div>
              <Link to="/events/my-rsvps" className="btn-view-all">
                View All <ArrowUpRight size={16} />
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
            <div className="section-header-left">
              <div className="section-icon">
                <Zap size={28} />
              </div>
              <div>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle">Discover exciting events happening soon</p>
              </div>
            </div>
            <Link to="/events" className="btn-view-all">
              Browse All <ArrowUpRight size={16} />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : filteredEvents.length > 0 ? (
            <>
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <EventCard 
                    key={event._id} 
                    event={event} 
                    showStatus={false}
                    onEventUpdate={handleEventUpdate}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <Calendar size={72} />
                </div>
                <h3 className="empty-state-title">No events found</h3>
                <p>Try changing your filters or check back later for new events</p>
                <div className="empty-state-actions">
                  <Link to="/events/create" className="btn-primary">
                    <PlusCircle size={20} />
                    Create Your First Event
                  </Link>
                  <button onClick={() => setQuickFilters('all')} className="btn-secondary">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;