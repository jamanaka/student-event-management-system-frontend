import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
import DashboardLayout from '../components/common/DashboardLayout';
import EventCard from '../components/common/EventCard';
import Spinner from '../components/common/Spinner';
import { useEventStore } from '../store/useEventStore';
import '../css/users/MyEventsPage.css';

const MyEventsPage = () => {
  const navigate = useNavigate();
  const { 
    userEvents, 
    loading, 
    fetchUserEvents,
    deleteEvent 
  } = useEventStore();

  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter]);

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm('Are you sure you want to delete this event? This action cannot be undone.');
    if (confirmed) {
      await deleteEvent(eventId);
      fetchUserEvents(statusFilter === 'all' ? undefined : statusFilter);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filteredEvents = statusFilter === 'all' 
    ? userEvents 
    : userEvents.filter(event => event.status === statusFilter);

  return (
    <DashboardLayout title="My Events">
      <div className="my-events-page">
        <div className="page-header">
          <div>
            <h1>My Events</h1>
            <p>Manage all events you've created</p>
          </div>
          <button
            onClick={() => navigate('/events/create')}
            className="btn-create"
          >
            <PlusCircle size={20} />
            Create Event
          </button>
        </div>

        <div className="filters-bar">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <p className="events-count">
            {loading ? 'Loading...' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <Spinner />
        ) : filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                showActions={true}
                showStatus={true}
                onDelete={handleDelete}
                onEdit={() => navigate(`/events/${event._id}/edit`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <PlusCircle size={64} color="#9ca3af" />
            <h3>No events found</h3>
            <p>
              {statusFilter === 'all'
                ? "You haven't created any events yet"
                : `No ${statusFilter} events found`}
            </p>
            <button
              onClick={() => navigate('/events/create')}
              className="btn-primary"
            >
              Create Your First Event
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyEventsPage;

