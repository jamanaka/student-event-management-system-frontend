import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Eye, UserCheck, UserX, UserCog,
  Trash2, ChevronLeft, ChevronRight, Download,
  Filter, Mail, Phone,
  Shield, TrendingUp, Calendar, FileText,
  RefreshCw, Check, X, AlertCircle, UserPlus,
  Lock, Unlock, Copy, Users as UsersIcon
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Modal from '../../components/common/Modal';
import { useAdminStore } from '../../store/useAdminStore';
import { exportToCSV } from '../../utils/exportUtils';
import { toastSuccess, toastError } from '../../lib/toast';
import '../../css/admin/Users.css';

const Users = () => {
  const {
    users,
    selectedUser,
    loading,
    pagination,
    fetchAllUsers,
    fetchUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    userStats
  } = useAdminStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Modal states
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    role: 'student',
    department: '',
    graduationYear: '',
    phone: ''
  });

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when filters change
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: 10,
      ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
      ...(roleFilter && { role: roleFilter }),
      ...(statusFilter && { isActive: statusFilter === 'active' }),
      ...(dateRange.start && dateRange.end && {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString()
      })
    };

    fetchAllUsers(filters);
  }, [debouncedSearchTerm, roleFilter, statusFilter, currentPage, dateRange, fetchAllUsers]);

  const handleRefresh = useCallback(async () => {
    setRefreshLoading(true);
    try {
      await fetchAllUsers({
        page: currentPage,
        limit: 10,
      });
    } finally {
      setRefreshLoading(false);
    }
  }, [fetchAllUsers, currentPage]);

  // Calculate user statistics
  const stats = useMemo(() => {
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.filter(user => !user.isActive).length;
    const studentUsers = users.filter(user => user.role === 'student').length;
    const adminUsers = users.filter(user => user.role === 'admin').length;

    // Calculate growth (if userStats includes previous period data)
    const growthRate = userStats?.growthRate || 0;
    const newUsersThisMonth = userStats?.newUsersThisMonth || 0;

    return {
      total: pagination.total || users.length,
      active: activeUsers,
      inactive: inactiveUsers,
      students: studentUsers,
      admins: adminUsers,
      growthRate,
      newUsersThisMonth,
      avgEventsPerUser: userStats?.avgEventsPerUser || 0,
      avgRSVPsPerUser: userStats?.avgRSVPsPerUser || 0
    };
  }, [users, pagination.total, userStats?.growthRate, userStats?.newUsersThisMonth, userStats?.avgEventsPerUser, userStats?.avgRSVPsPerUser]);

  // Handle user selection
  const handleSelectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user._id));
    }
  }, [users, selectedUsers.length]);

  // Handle user actions
  const handleViewUser = useCallback(async (userId) => {
    await fetchUserById(userId);
    setShowUserDetailsModal(true);
  }, [fetchUserById]);

  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
    const success = await updateUserStatus(userId, !currentStatus);
    if (success) {
      handleRefresh();
    }
  }, [updateUserStatus, handleRefresh]);

  const handleChangeRole = useCallback((user) => {
    setUserToChangeRole(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  }, []);

  const handleRoleSubmit = useCallback(async () => {
    if (userToChangeRole && newRole !== userToChangeRole.role) {
      const success = await updateUserRole(userToChangeRole._id, newRole);
      if (success) {
        setShowRoleModal(false);
        setUserToChangeRole(null);
        handleRefresh();
      }
    }
  }, [userToChangeRole, newRole, updateUserRole, handleRefresh]);

  const handleDeleteUser = useCallback((user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete._id);
      if (success) {
        setShowDeleteModal(false);
        setUserToDelete(null);
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          handleRefresh();
        }
      }
    }
  }, [userToDelete, deleteUser, users.length, currentPage, handleRefresh]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action, value) => {
    if (selectedUsers.length === 0) return;

    try {
      let successCount = 0;
      let failCount = 0;

      switch (action) {
        case 'role':
          // Bulk role update
          for (const userId of selectedUsers) {
            const success = await updateUserRole(userId, value);
            if (success) successCount++;
            else failCount++;
          }
          if (successCount > 0) {
            toastSuccess(`Updated role for ${successCount} user${successCount !== 1 ? 's' : ''} successfully!`);
          }
          if (failCount > 0) {
            toastError(`Failed to update role for ${failCount} user${failCount !== 1 ? 's' : ''}`);
          }
          setShowBulkRoleModal(false);
          break;
        case 'status':
          // Bulk status update
          for (const userId of selectedUsers) {
            const success = await updateUserStatus(userId, value);
            if (success) successCount++;
            else failCount++;
          }
          if (successCount > 0) {
            toastSuccess(`${value ? 'Activated' : 'Deactivated'} ${successCount} user${successCount !== 1 ? 's' : ''} successfully!`);
          }
          if (failCount > 0) {
            toastError(`Failed to update status for ${failCount} user${failCount !== 1 ? 's' : ''}`);
          }
          setShowBulkStatusModal(false);
          break;
        case 'delete':
          // Bulk delete - confirm with user first
          if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
            for (const userId of selectedUsers) {
              const success = await deleteUser(userId);
              if (success) successCount++;
              else failCount++;
            }
            if (successCount > 0) {
              toastSuccess(`Deleted ${successCount} user${successCount !== 1 ? 's' : ''} successfully!`);
            }
            if (failCount > 0) {
              toastError(`Failed to delete ${failCount} user${failCount !== 1 ? 's' : ''}`);
            }
          }
          break;
        default:
          console.warn('Unknown bulk action:', action);
          break;
      }
    } catch (error) {
      toastError('An error occurred during bulk operation');
    }

    setSelectedUsers([]);
    handleRefresh();
  }, [selectedUsers, updateUserRole, updateUserStatus, deleteUser, handleRefresh]);

  // Handle create user
  const handleCreateUser = useCallback(async () => {
    // TODO: Implement user creation API call
    // For now, show a message that this feature is coming soon
    toastError('User creation feature is not yet implemented. Please contact the development team.');
    setShowCreateUserModal(false);
    setNewUserData({
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      role: 'student',
      department: '',
      graduationYear: '',
      phone: ''
    });
  }, []);

  // Handle export
  const handleExportUsers = useCallback(() => {
    const data = users.map(user => ({
      'Full Name': `${user.firstName} ${user.lastName}`,
      'Email': user.email,
      'Student ID': user.studentId || 'N/A',
      'Role': user.role,
      'Status': user.isActive ? 'Active' : 'Inactive',
      'Department': user.department || 'N/A',
      'Graduation Year': user.graduationYear || 'N/A',
      'Created At': new Date(user.createdAt).toLocaleDateString(),
      'Last Updated': new Date(user.updatedAt).toLocaleDateString()
    }));
    
    exportToCSV(data, `users-export-${new Date().toISOString().split('T')[0]}`);
  }, [users]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Get user initials for avatar
  const getUserInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get user status icon
  const getStatusIcon = (isActive) => {
    return isActive ? <Check size={12} /> : <X size={12} />;
  };

  // Get user role icon
  const getRoleIcon = (role) => {
    return role === 'admin' ? <Shield size={12} /> : <UsersIcon size={12} />;
  };

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setDateRange({ start: null, end: null });
    setCurrentPage(1);
  }, []);

  return (
    <DashboardLayout title="User Management" isAdmin={true}>
      <div className="admin-users">
        {/* Header with Stats */}
        <div className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-title-section">
              <h1 className="admin-page-title">User Management</h1>
              <p className="admin-page-subtitle">
                Manage user accounts, roles, and permissions across the platform
              </p>
            </div>
            <div className="admin-header-actions">
              <button
                onClick={handleRefresh}
                className="admin-btn-secondary"
                disabled={refreshLoading}
                title="Refresh users"
              >
                <RefreshCw size={18} className={refreshLoading ? 'spinning' : ''} />
                Refresh
              </button>
              <button
                onClick={handleExportUsers}
                className="admin-btn-secondary"
                title="Export to CSV"
              >
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="admin-stats-overview">
            <div className="admin-stat-card" onClick={() => setStatusFilter('active')}>
              <div className="admin-stat-icon active">
                <UserCheck size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{stats.active}</div>
                <div className="admin-stat-label">Active Users</div>
                <div className="admin-stat-change">
                  <TrendingUp size={12} />
                  <span>{stats.growthRate}% this month</span>
                </div>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setStatusFilter('inactive')}>
              <div className="admin-stat-icon inactive">
                <UserX size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{stats.inactive}</div>
                <div className="admin-stat-label">Inactive Users</div>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setRoleFilter('student')}>
              <div className="admin-stat-icon student">
                <UsersIcon size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{stats.students}</div>
                <div className="admin-stat-label">Students</div>
                <div className="admin-stat-hint">
                  {stats.avgEventsPerUser} avg events/user
                </div>
              </div>
            </div>

            <div className="admin-stat-card" onClick={() => setRoleFilter('admin')}>
              <div className="admin-stat-icon admin">
                <Shield size={24} />
              </div>
              <div className="admin-stat-content">
                <div className="admin-stat-value">{stats.admins}</div>
                <div className="admin-stat-label">Admins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="admin-bulk-actions">
            <div className="bulk-selection-info">
              <div className="bulk-selection-count">
                <Check size={16} />
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </div>
              <button
                onClick={() => setSelectedUsers([])}
                className="bulk-clear-selection"
              >
                Clear
              </button>
            </div>
            
            <div className="bulk-action-buttons">
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="bulk-action-btn activate"
              >
                <UserCheck size={16} />
                Activate
              </button>
              <button
                onClick={() => setShowBulkStatusModal(true)}
                className="bulk-action-btn deactivate"
              >
                <UserX size={16} />
                Deactivate
              </button>
              <button
                onClick={() => setShowBulkRoleModal(true)}
                className="bulk-action-btn role"
              >
                <UserCog size={16} />
                Change Role
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="bulk-action-btn delete"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button
                onClick={() => {
                  const emailList = selectedUsers.map(userId => {
                    const user = users.find(u => u._id === userId);
                    return user?.email;
                  }).filter(Boolean).join(',');
                  if (emailList) {
                    window.open(`mailto:${emailList}?subject=Important Update from Event Management System&body=Dear users,%0A%0AThis is an important update regarding your account.%0A%0ABest regards,%0AAdmin Team`);
                  }
                }}
                className="bulk-action-btn email"
              >
                <Mail size={16} />
                Email
              </button>
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="admin-results-header">
          <div className="admin-results-info">
            <div className="admin-results-count">
              {loading ? (
                <div className="admin-loading-text">
                  <RefreshCw size={14} className="spinning" />
                  Loading users...
                </div>
              ) : (
                <>
                  <span className="admin-count-value">{pagination.total}</span>
                  <span className="admin-count-label"> user{pagination.total !== 1 ? 's' : ''} found</span>
                  {(searchTerm || roleFilter || statusFilter) && (
                    <span className="admin-filter-indicator">
                      <Filter size={12} />
                      {searchTerm && `Search: "${searchTerm}"`}
                      {roleFilter && `Role: ${roleFilter}`}
                      {statusFilter && `Status: ${statusFilter}`}
                    </span>
                  )}
                </>
              )}
            </div>

            {!loading && pagination.total > 0 && (
              <div className="admin-results-summary">
                <span className="admin-summary-item">
                  <UserCheck size={14} color="#10b981" />
                  {stats.active} active
                </span>
                <span className="admin-summary-item">
                  <Shield size={14} color="#f59e0b" />
                  {stats.admins} admins
                </span>
                <span className="admin-summary-item">
                  <Calendar size={14} color="#667eea" />
                  {stats.newUsersThisMonth} new this month
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        {loading && users.length === 0 ? (
          <div className="admin-loading-container">
            <div className="admin-loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <div className="empty-state-icon">
              <UsersIcon size={64} />
              <div className="empty-state-glow"></div>
            </div>
            <h3 className="empty-state-title">No users found</h3>
            <p className="empty-state-text">
              {searchTerm || roleFilter || statusFilter || dateRange.start
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "No users in the system yet. Add your first user to get started."}
            </p>
            <div className="empty-state-actions">
              {(searchTerm || roleFilter || statusFilter || dateRange.start) && (
                <button
                  onClick={handleClearFilters}
                  className="admin-btn-secondary"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setShowCreateUserModal(true)}
                className="admin-btn-primary"
              >
                <UserPlus size={18} />
                Add First User
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-users-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th className="admin-select-column">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={handleSelectAll}
                        className="admin-select-checkbox"
                      />
                    </th>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className={selectedUsers.includes(user._id) ? 'selected' : ''}>
                      <td className="admin-select-cell">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="admin-select-checkbox"
                        />
                      </td>
                      <td>
                        <div className="admin-user-info">
                          <div className={`admin-user-avatar admin-avatar-${user.role}`}>
                            {getUserInitials(user.firstName, user.lastName)}
                          </div>
                          <div className="admin-user-details">
                            <div className="admin-user-name">
                              {user.firstName} {user.lastName}
                              {user.role === 'admin' && (
                                <span className="admin-user-admin-badge">
                                  <Shield size={10} />
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="admin-user-meta">
                              <span className="admin-user-id">
                                {user.studentId || 'No ID'}
                              </span>
                              {user.department && (
                                <>
                                  <span className="admin-meta-separator">•</span>
                                  <span className="admin-user-department">
                                    {user.department}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-contact">
                          <div className="admin-user-email">
                            <Mail size={12} />
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                          </div>
                          {user.phone && (
                            <div className="admin-user-phone">
                              <Phone size={12} />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-role">
                          {getRoleIcon(user.role)}
                          <span className={`admin-role-badge admin-role-${user.role}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-status">
                          {getStatusIcon(user.isActive)}
                          <span className={`admin-status-badge admin-status-${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className="admin-status-toggle"
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {user.isActive ? <Lock size={12} /> : <Unlock size={12} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="admin-user-activity">
                          <div className="admin-activity-stats">
                            <div className="admin-activity-stat">
                              <Calendar size={12} />
                              <span>{user.stats?.eventsCreated || 0}</span>
                            </div>
                            <div className="admin-activity-stat">
                              <FileText size={12} />
                              <span>{user.stats?.rsvpsCount || 0}</span>
                            </div>
                          </div>
                          <div className="admin-user-joined">
                            Joined {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-action-menu">
                          <button
                            className="admin-action-btn view"
                            onClick={() => handleViewUser(user._id)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="admin-action-btn role"
                            onClick={() => handleChangeRole(user)}
                            title="Change Role"
                          >
                            <UserCog size={16} />
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.total)} of {pagination.total} users
                </div>
                <div className="admin-pagination-controls">
                  <button
                    className="admin-pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <div className="admin-page-numbers">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`admin-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="admin-pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        {/* User Details Modal */}
        <Modal
          isOpen={showUserDetailsModal}
          onClose={() => setShowUserDetailsModal(false)}
          title="User Details"
          size="large"
        >
          {selectedUser && (
            <div className="admin-user-details-modal">
              <div className="user-details-header">
                <div className="user-avatar-large">
                  {getUserInitials(selectedUser.firstName, selectedUser.lastName)}
                </div>
                <div className="user-header-info">
                  <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="user-email">{selectedUser.email}</p>
                  <div className="user-header-badges">
                    <span className={`admin-role-badge admin-role-${selectedUser.role}`}>
                      {getRoleIcon(selectedUser.role)}
                      {selectedUser.role}
                    </span>
                    <span className={`admin-status-badge admin-status-${selectedUser.isActive ? 'active' : 'inactive'}`}>
                      {getStatusIcon(selectedUser.isActive)}
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="user-details-grid">
                <div className="details-section">
                  <h4>Personal Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Student ID</label>
                      <div className="detail-value">
                        {selectedUser.studentId || 'N/A'}
                        {selectedUser.studentId && (
                          <button
                            onClick={() => navigator.clipboard.writeText(selectedUser.studentId)}
                            className="copy-btn"
                            title="Copy to clipboard"
                          >
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Department</label>
                      <span>{selectedUser.department || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Graduation Year</label>
                      <span>{selectedUser.graduationYear || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{selectedUser.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Account Information</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Joined Date</label>
                      <span>{formatDate(selectedUser.createdAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Updated</label>
                      <span>{formatDate(selectedUser.updatedAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Login</label>
                      <span>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Activity Statistics</h4>
                  <div className="activity-stats">
                    <div className="activity-stat-card">
                      <div className="activity-stat-icon events">
                        <Calendar size={20} />
                      </div>
                      <div className="activity-stat-content">
                        <div className="activity-stat-value">{selectedUser.stats?.eventsCreated || 0}</div>
                        <div className="activity-stat-label">Events Created</div>
                      </div>
                    </div>
                    <div className="activity-stat-card">
                      <div className="activity-stat-icon rsvps">
                        <FileText size={20} />
                      </div>
                      <div className="activity-stat-content">
                        <div className="activity-stat-value">{selectedUser.stats?.rsvpsCount || 0}</div>
                        <div className="activity-stat-label">RSVPs Made</div>
                      </div>
                    </div>
                    <div className="activity-stat-card">
                      <div className="activity-stat-icon attendance">
                        <Check size={20} />
                      </div>
                      <div className="activity-stat-content">
                        <div className="activity-stat-value">{selectedUser.stats?.attendanceRate || 0}%</div>
                        <div className="activity-stat-label">Attendance Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Quick Actions</h4>
                  <div className="quick-actions">
                    <button
                      onClick={() => handleToggleStatus(selectedUser._id, selectedUser.isActive)}
                      className={`action-btn ${selectedUser.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {selectedUser.isActive ? (
                        <>
                          <UserX size={16} />
                          Deactivate User
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Activate User
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDetailsModal(false);
                        handleChangeRole(selectedUser);
                      }}
                      className="action-btn role"
                    >
                      <UserCog size={16} />
                      Change Role
                    </button>
                    <button
                      onClick={() => {
                        window.open(`mailto:${selectedUser.email}?subject=Important Update from Event Management System&body=Dear ${selectedUser.firstName},${'%0A%0A'}This is an important update regarding your account.${'%0A%0A'}Best regards,${'%0A'}Admin Team`);
                      }}
                      className="action-btn email"
                    >
                      <Mail size={16} />
                      Send Email
                    </button>
                    <button
                      onClick={() => {
                        setShowUserDetailsModal(false);
                        handleDeleteUser(selectedUser);
                      }}
                      className="action-btn delete"
                    >
                      <Trash2 size={16} />
                      Delete User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete User"
          size="medium"
        >
          <div className="admin-delete-modal-content">
            <div className="delete-warning-icon">
              <AlertCircle size={48} color="#ef4444" />
            </div>
            <h3>Delete User Account</h3>
            <p className="warning-text">
              Are you sure you want to permanently delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
            </p>
            <div className="delete-details">
              <p>This action will:</p>
              <ul>
                <li>Permanently delete the user account</li>
                <li>Remove all user data from the system</li>
                <li>Delete any events created by this user</li>
                <li>Remove all RSVPs made by this user</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleDeleteConfirm}
              >
                <Trash2 size={16} />
                Delete User Account
              </button>
            </div>
          </div>
        </Modal>

        {/* Change Role Modal */}
        <Modal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          title="Change User Role"
          size="small"
        >
          <div className="admin-role-modal-content">
            <p>
              Change role for <strong>{userToChangeRole?.firstName} {userToChangeRole?.lastName}</strong>
            </p>
            
            <div className="role-options">
              <div className={`role-option ${newRole === 'student' ? 'selected' : ''}`}
                   onClick={() => setNewRole('student')}>
                <div className="role-option-icon student">
                  <UsersIcon size={20} />
                </div>
                <div className="role-option-content">
                  <div className="role-option-title">Student</div>
                  <div className="role-option-description">
                    Can create events and RSVP to events
                  </div>
                </div>
                {newRole === 'student' && <Check size={16} className="role-selected" />}
              </div>
              
              <div className={`role-option ${newRole === 'admin' ? 'selected' : ''}`}
                   onClick={() => setNewRole('admin')}>
                <div className="role-option-icon admin">
                  <Shield size={20} />
                </div>
                <div className="role-option-content">
                  <div className="role-option-title">Administrator</div>
                  <div className="role-option-description">
                    Full access to all admin features and user management
                  </div>
                </div>
                {newRole === 'admin' && <Check size={16} className="role-selected" />}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowRoleModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleRoleSubmit}
                disabled={newRole === userToChangeRole?.role}
              >
                Update Role
              </button>
            </div>
          </div>
        </Modal>

        {/* Bulk Status Modal */}
        <Modal
          isOpen={showBulkStatusModal}
          onClose={() => setShowBulkStatusModal(false)}
          title="Update User Status"
          size="small"
        >
          <div className="admin-bulk-modal-content">
            <p>
              Update status for <strong>{selectedUsers.length}</strong> selected user{selectedUsers.length !== 1 ? 's' : ''}
            </p>
            <div className="bulk-action-options">
              <button
                onClick={() => handleBulkAction('status', true)}
                className="bulk-action-option activate"
              >
                <UserCheck size={20} />
                <div>
                  <div className="option-title">Activate Users</div>
                  <div className="option-description">Users will be able to access the platform</div>
                </div>
              </button>
              <button
                onClick={() => handleBulkAction('status', false)}
                className="bulk-action-option deactivate"
              >
                <UserX size={20} />
                <div>
                  <div className="option-title">Deactivate Users</div>
                  <div className="option-description">Users will be temporarily suspended</div>
                </div>
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowBulkStatusModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Bulk Role Modal */}
        <Modal
          isOpen={showBulkRoleModal}
          onClose={() => setShowBulkRoleModal(false)}
          title="Change User Roles"
          size="small"
        >
          <div className="admin-bulk-modal-content">
            <p>
              Change role for <strong>{selectedUsers.length}</strong> selected user{selectedUsers.length !== 1 ? 's' : ''}
            </p>
            <div className="bulk-action-options">
              <button
                onClick={() => handleBulkAction('role', 'student')}
                className="bulk-action-option student"
              >
                <UsersIcon size={20} />
                <div>
                  <div className="option-title">Set as Students</div>
                  <div className="option-description">Standard user permissions</div>
                </div>
              </button>
              <button
                onClick={() => handleBulkAction('role', 'admin')}
                className="bulk-action-option admin"
              >
                <Shield size={20} />
                <div>
                  <div className="option-title">Set as Administrators</div>
                  <div className="option-description">Full admin permissions</div>
                </div>
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowBulkRoleModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Create User Modal */}
        <Modal
          isOpen={showCreateUserModal}
          onClose={() => setShowCreateUserModal(false)}
          title="Create New User"
          size="medium"
        >
          <div className="admin-create-user-modal">
            <p>Create a new user account in the system.</p>

            <div className="create-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    id="studentId"
                    type="text"
                    value={newUserData.studentId}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="Enter student ID"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={newUserData.role}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    id="department"
                    type="text"
                    value={newUserData.department}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Enter department"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Year</label>
                  <input
                    id="graduationYear"
                    type="number"
                    value={newUserData.graduationYear}
                    onChange={(e) => setNewUserData(prev => ({ ...prev, graduationYear: e.target.value }))}
                    placeholder="Enter graduation year"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateUserModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateUser}
                disabled={!newUserData.firstName || !newUserData.lastName || !newUserData.email}
              >
                <UserPlus size={16} />
                Create User
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Users;