import React, { useEffect, useState } from 'react';
import { 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  User, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  GraduationCap
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { useAdminStore } from '../../store/useAdminStore';
import { useAuthStore } from '../../store/useAuthStore';
import '../../css/admin/Users.css';

const Users = () => {
  const { user: currentUser } = useAuthStore();
  const { 
    users, 
    selectedUser,
    loading, 
    pagination,
    fetchAllUsers,
    fetchUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser
  } = useAdminStore();

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    page: 1,
    limit: 20,
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToModify, setUserToModify] = useState(null);
  const [newRole, setNewRole] = useState<'student' | 'admin'>('student');

  useEffect(() => {
    const params = {
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 20,
    };
    
    // Remove empty filters
    if (!params.search) delete params.search;
    if (!params.role) delete params.role;
    if (params.isActive === '') delete params.isActive;
    else if (params.isActive !== undefined) {
      params.isActive = params.isActive === 'true';
    }

    fetchAllUsers(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleViewUser = async (userId) => {
    await fetchUserById(userId);
    setShowUserModal(true);
  };

  const handleToggleStatus = async (user) => {
    const success = await updateUserStatus(user._id, !user.isActive);
    if (success) {
      // Refresh the list
      const params = { ...filters };
      if (!params.search) delete params.search;
      if (!params.role) delete params.role;
      if (params.isActive === '') delete params.isActive;
      else if (params.isActive !== undefined) {
        params.isActive = params.isActive === 'true';
      }
      fetchAllUsers(params);
    }
  };

  const handleRoleChangeClick = (user) => {
    setUserToModify(user);
    setNewRole(user.role === 'admin' ? 'student' : 'admin');
    setShowRoleModal(true);
  };

  const handleRoleChange = async () => {
    if (userToModify) {
      const success = await updateUserRole(userToModify._id, newRole);
      if (success) {
        setShowRoleModal(false);
        setUserToModify(null);
        // Refresh the list
        const params = { ...filters };
        if (!params.search) delete params.search;
        if (!params.role) delete params.role;
        if (params.isActive === '') delete params.isActive;
        else if (params.isActive !== undefined) {
          params.isActive = params.isActive === 'true';
        }
        fetchAllUsers(params);
      }
    }
  };

  const handleDeleteClick = (user) => {
    setUserToModify(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (userToModify) {
      const success = await deleteUser(userToModify._id);
      if (success) {
        setShowDeleteModal(false);
        setUserToModify(null);
        // Refresh the list
        const params = { ...filters };
        if (!params.search) delete params.search;
        if (!params.role) delete params.role;
        if (params.isActive === '') delete params.isActive;
        else if (params.isActive !== undefined) {
          params.isActive = params.isActive === 'true';
        }
        fetchAllUsers(params);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <DashboardLayout title="User Management" isAdmin={true}>
      <div className="admin-users">
        {/* Filters */}
        <div className="admin-filters-container">
          <div className="admin-search-bar">
            <Search className="admin-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or student ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-filter-controls">
            <div className="admin-filter-group">
              <label>Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="admin-filter-select"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="admin-filter-group">
              <label>Status</label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="admin-filter-select"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination Info */}
        <div className="admin-results-header">
          <div className="admin-results-count">
            {loading ? 'Loading...' : (
              <>
                Showing {pagination.count} of {pagination.total} users
                {filters.search && ` matching "${filters.search}"`}
              </>
            )}
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="admin-loading-container">
            <Spinner />
          </div>
        ) : safeUsers.length > 0 ? (
          <>
            <div className="admin-users-table-container">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {safeUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="admin-user-info">
                          <div className="admin-user-avatar">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div className="admin-user-details">
                            <div className="admin-user-name">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.studentId && (
                              <div className="admin-user-student-id">
                                <GraduationCap size={12} />
                                {user.studentId}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-email-cell">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-role-badge admin-role-${user.role}`}>
                          <Shield size={12} />
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-badge admin-status-${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? (
                            <>
                              <UserCheck size={12} />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={12} />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="admin-date-cell">
                          <Calendar size={12} />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="admin-action-buttons">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="admin-btn-action admin-btn-view"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`admin-btn-action ${user.isActive ? 'admin-btn-deactivate' : 'admin-btn-activate'}`}
                            disabled={user._id === currentUser?._id}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => handleRoleChangeClick(user)}
                            className="admin-btn-action admin-btn-role"
                            disabled={user._id === currentUser?._id}
                            title="Change Role"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="admin-btn-action admin-btn-delete"
                            disabled={user._id === currentUser?._id}
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
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="admin-pagination-btn"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <div className="admin-pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="admin-pagination-btn"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="admin-empty-state">
            <User size={48} color="#9ca3af" />
            <p>No users found matching your filters</p>
          </div>
        )}

        {/* User Details Modal */}
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
          }}
          title="User Details"
          size="large"
        >
          {selectedUser && (
            <div className="admin-user-details-modal">
              <div className="admin-user-details-header">
                <div className="admin-user-avatar-large">
                  {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                </div>
                <div>
                  <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="admin-user-email">{selectedUser.email}</p>
                </div>
              </div>

              <div className="admin-user-details-grid">
                <div className="admin-detail-item">
                  <label>Role</label>
                  <span className={`admin-role-badge admin-role-${selectedUser.role}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <label>Status</label>
                  <span className={`admin-status-badge admin-status-${selectedUser.isActive ? 'active' : 'inactive'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {selectedUser.studentId && (
                  <div className="admin-detail-item">
                    <label>Student ID</label>
                    <span>{selectedUser.studentId}</span>
                  </div>
                )}
                {selectedUser.department && (
                  <div className="admin-detail-item">
                    <label>Department</label>
                    <span>{selectedUser.department}</span>
                  </div>
                )}
                {selectedUser.graduationYear && (
                  <div className="admin-detail-item">
                    <label>Graduation Year</label>
                    <span>{selectedUser.graduationYear}</span>
                  </div>
                )}
                <div className="admin-detail-item">
                  <label>Joined</label>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                {selectedUser.stats && (
                  <>
                    <div className="admin-detail-item">
                      <label>Events Created</label>
                      <span>{selectedUser.stats.eventsCreated || 0}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>RSVPs</label>
                      <span>{selectedUser.stats.rsvpsCount || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToModify(null);
          }}
          title="Delete User"
        >
          {userToModify && (
            <div className="admin-delete-modal-content">
              <p>
                Are you sure you want to delete <strong>{userToModify.firstName} {userToModify.lastName}</strong>?
              </p>
              <p className="admin-warning-text">
                This action cannot be undone. All events and RSVPs associated with this user will also be deleted.
              </p>
              <div className="admin-modal-actions">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToModify(null);
                  }}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="admin-btn-delete-submit"
                >
                  Delete User
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Role Change Modal */}
        <Modal
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            setUserToModify(null);
          }}
          title="Change User Role"
        >
          {userToModify && (
            <div className="admin-role-modal-content">
              <p>
                Change role for <strong>{userToModify.firstName} {userToModify.lastName}</strong>
              </p>
              <div className="admin-form-group">
                <label htmlFor="newRole" className="admin-form-label">
                  New Role
                </label>
                <select
                  id="newRole"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="admin-form-select"
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setUserToModify(null);
                  }}
                  className="admin-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleChange}
                  className="admin-btn-primary"
                >
                  Update Role
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Users;

