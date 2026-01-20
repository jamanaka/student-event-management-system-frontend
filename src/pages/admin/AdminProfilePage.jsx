import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../components/common/DashboardLayout';
import '../../css/admin/ProfilePage.css';

const AdminProfilePage = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        department: user.department || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      department: user?.department || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="profile-page">
          <div className="loading">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout isAdmin={true}>
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} />
          </div>
          <div className="profile-info">
            <div className="profile-name-section">
              <h1>{user.firstName} {user.lastName}</h1>
              <div className="profile-role-badge">
                <Shield size={16} color="#10b981" />
                <span>Administrator</span>
              </div>
            </div>
            <p className="profile-email">
              <Mail size={16} />
              {user.email}
            </p>
            {user.department && (
              <p className="profile-department">
                Department: {user.department}
              </p>
            )}
            <p className="profile-join-date">
              <Calendar size={16} />
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="profile-actions">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-profile-btn"
                disabled={isLoading}
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button
                  onClick={handleSave}
                  className="save-btn"
                  disabled={isLoading}
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                  disabled={isLoading}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <div className="display-value">{user.firstName}</div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    <div className="display-value">{user.lastName}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="display-value">{user.email}</div>
                  <small className="form-hint">Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Enter your department"
                    />
                  ) : (
                    <div className="display-value">{user.department || 'Not specified'}</div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <div className="display-value">
                    <div className="role-display">
                      <Shield size={16} color="#10b981" />
                      Administrator
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Account Status</label>
                  <div className="display-value">
                    <div className="status-active">
                      <div className="status-dot"></div>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Administrator Privileges</h2>
            <div className="admin-privileges">
              <div className="privilege-item">
                <Shield size={20} color="#10b981" />
                <div>
                  <h4>Event Management</h4>
                  <p>Approve, reject, and manage all event submissions</p>
                </div>
              </div>
              <div className="privilege-item">
                <User size={20} color="#3b82f6" />
                <div>
                  <h4>User Management</h4>
                  <p>View and manage user accounts and permissions</p>
                </div>
              </div>
              <div className="privilege-item">
                <Calendar size={20} color="#f59e0b" />
                <div>
                  <h4>System Oversight</h4>
                  <p>Monitor system statistics and event analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminProfilePage;