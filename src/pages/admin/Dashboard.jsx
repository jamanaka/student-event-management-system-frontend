import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  UserCheck,
  UserX,
  Activity,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import EventCard from '../../components/common/EventCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { useEventStore } from '../../store/useEventStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAdminStore } from '../../store/useAdminStore';
import '../../css/admin/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { 
    pendingEvents, 
    events, 
    loading, 
    fetchPendingEvents, 
    fetchEvents,
    approveEvent,
    rejectEvent
  } = useEventStore();
  
  const {
    systemStats,
    loading: adminLoading,
    fetchSystemStats
  } = useAdminStore();


  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        fetchPendingEvents(),
        fetchEvents({ limit: 10, status: 'approved', sort: 'newest', page: 1 }),
        fetchSystemStats()
      ]);
    };
    loadDashboardData();
  }, [fetchPendingEvents, fetchEvents, fetchSystemStats]);


  const handleApprove = async (eventId) => {
    const success = await approveEvent(eventId);
    if (success) {
      fetchPendingEvents();
      fetchEvents();
    }
  };

  const handleReject = async (eventId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason && reason.trim()) {
      const success = await rejectEvent(eventId, reason.trim());
      if (success) {
        fetchPendingEvents();
      }
    }
  };

  const stats = systemStats || {
    users: { total: 0, active: 0, inactive: 0, byRole: [] },
    events: { total: 0, approved: 0, pending: 0, upcoming: 0, byCategory: [] },
    rsvps: { total: 0 },
    recentActivity: { eventsCreated: 0, usersRegistered: 0, period: '7 days' }
  };

  return (
    <DashboardLayout title="Admin Dashboard" isAdmin={true}>
      <div className="admin-dashboard">
        {/* Welcome Section */}
        <div className="admin-welcome-section">
          <div>
            <h1 className="admin-welcome-title">Welcome back, {user?.firstName || 'Admin'}!</h1>
            <p className="admin-welcome-subtitle">Here's what's happening with your event management system</p>
          </div>
          <div className="admin-quick-actions">
            <Link to="/admin/pending" className="admin-quick-action-btn">
              <AlertCircle size={18} />
              Review Pending
            </Link>
            <Link to="/admin/users" className="admin-quick-action-btn">
              <Users size={18} />
              Manage Users
            </Link>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card admin-stat-primary">
            <div className="admin-stat-icon">
              <Users className="admin-icon" size={28} />
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">TOTAL USERS</p>
              <h3 className="admin-stat-value">{stats.users.total}</h3>
              <div className="admin-stat-details">
                <span className="admin-stat-detail-item">
                  <UserCheck size={14} />
                  {stats.users.active} active
                </span>
                <span className="admin-stat-detail-item">
                  <UserX size={14} />
                  {stats.users.inactive} inactive
                </span>
              </div>
            </div>
          </div>

          <div className="admin-stat-card admin-stat-warning">
            <div className="admin-stat-icon">
              <Clock className="admin-icon" size={28} />
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">PENDING APPROVAL</p>
              <h3 className="admin-stat-value">{stats.events.pending}</h3>
              <p className="admin-stat-status">Events awaiting review</p>
              {stats.events.pending > 0 && (
                <Link to="/admin/pending" className="admin-stat-action-link">
                  Review now <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </div>

          <div className="admin-stat-card admin-stat-success">
            <div className="admin-stat-icon">
              <Calendar className="admin-icon" size={28} />
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">TOTAL EVENTS</p>
              <h3 className="admin-stat-value">{stats.events.total}</h3>
              <div className="admin-stat-details">
                <span className="admin-stat-detail-item">
                  <CheckCircle size={14} />
                  {stats.events.approved} approved
                </span>
                <span className="admin-stat-detail-item">
                  <TrendingUp size={14} />
                  {stats.events.upcoming} upcoming
                </span>
              </div>
            </div>
          </div>

          <div className="admin-stat-card admin-stat-info">
            <div className="admin-stat-icon">
              <Activity className="admin-icon" size={28} />
            </div>
            <div className="admin-stat-content">
              <p className="admin-stat-label">TOTAL RSVPS</p>
              <h3 className="admin-stat-value">{stats.rsvps.total}</h3>
              <p className="admin-stat-status">Event registrations</p>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        {adminLoading ? (
          <div className="admin-secondary-stats-grid">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <div className="admin-secondary-stats-grid">
            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <span className="admin-secondary-stat-label">Recent Activity</span>
                <Activity size={16} color="#64748b" />
              </div>
              <div className="admin-secondary-stat-content">
                <div className="admin-secondary-stat-item">
                  <span>Events Created (7 days)</span>
                  <span className="admin-secondary-stat-value">{stats.recentActivity.eventsCreated}</span>
                </div>
                <div className="admin-secondary-stat-item">
                  <span>New Users (7 days)</span>
                  <span className="admin-secondary-stat-value">{stats.recentActivity.usersRegistered}</span>
                </div>
              </div>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <span className="admin-secondary-stat-label">Users by Role</span>
                <BarChart3 size={16} color="#64748b" />
              </div>
              <div className="admin-secondary-stat-content">
                {stats.users.byRole.length > 0 ? (
                  stats.users.byRole.map((role) => (
                    <div key={role._id} className="admin-secondary-stat-item">
                      <span className="admin-role-badge">{role._id}</span>
                      <span className="admin-secondary-stat-value">{role.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="admin-secondary-stat-item">
                    <span className="admin-category-name">No data available</span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-secondary-stat-card">
              <div className="admin-secondary-stat-header">
                <span className="admin-secondary-stat-label">Events by Category</span>
                <BarChart3 size={16} color="#64748b" />
              </div>
              <div className="admin-secondary-stat-content">
                {stats.events.byCategory.length > 0 ? (
                  stats.events.byCategory.slice(0, 5).map((cat) => (
                    <div key={cat._id} className="admin-secondary-stat-item">
                      <span className="admin-category-name">{cat._id || 'Other'}</span>
                      <span className="admin-secondary-stat-value">{cat.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="admin-secondary-stat-item">
                    <span className="admin-category-name">No data available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Events Section */}
        {pendingEvents.length > 0 && (
          <section className="admin-dashboard-section">
            <div className="admin-section-header">
              <div>
                <h2 className="admin-section-title">
                  <AlertCircle size={24} style={{ marginRight: '8px', color: '#f59e0b' }} />
                  Pending Events ({pendingEvents.length})
                </h2>
                <p className="admin-section-subtitle">Events awaiting your approval</p>
              </div>
              <Link to="/admin/pending" className="admin-btn-view-all">
                View All <ArrowUpRight size={16} />
              </Link>
            </div>

            {loading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <div className="admin-events-grid">
                {pendingEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="admin-pending-event-wrapper">
                    <EventCard event={event} showStatus={true} adminView={true} />
                    <div className="admin-pending-actions">
                      <button
                        onClick={() => handleApprove(event._id)}
                        className="admin-btn-approve"
                        disabled={loading}
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(event._id)}
                        className="admin-btn-reject"
                        disabled={loading}
                      >
                        <AlertCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent Events Section */}
        <section className="admin-dashboard-section">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">
                <Calendar size={24} style={{ marginRight: '8px', color: '#3b82f6' }} />
                Recent Approved Events
              </h2>
              <p className="admin-section-subtitle">Latest events in the system</p>
            </div>
            <Link to="/admin/events" className="admin-btn-view-all">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={6} />
          ) : events.length > 0 ? (
            <div className="admin-events-grid">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event._id} event={event} showStatus={true} adminView={true} />
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <Calendar size={48} color="#9ca3af" />
              <p>No approved events found</p>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                Approved events will appear here once they are created and approved.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
