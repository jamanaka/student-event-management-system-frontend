import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Mail, GraduationCap, Calendar,
  Save, Lock, Eye, EyeOff, X, Shield,
  Globe,
  CheckCircle, AlertCircle, Upload,
  LogOut, Key, Building,
  Edit2, Trash2, Loader
} from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../../components/common/Modal';
import '../../css/users/UserProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout, isLoading } = useAuthStore();
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    graduationYear: '',
    phone: '',
    bio: '',
    website: '',
    location: '',
    pronouns: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        studentId: user.studentId || '',
        department: user.department || '',
        graduationYear: user.graduationYear?.toString() || '',
        phone: user.phone || '',
        bio: user.bio || '',
        website: user.website || '',
        location: user.location || '',
        pronouns: user.pronouns || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Handle profile form changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (profileMessage.text) setProfileMessage({ type: '', text: '' });
  }, [profileMessage]);

  // Handle password form changes
  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordMessage.text) setPasswordMessage({ type: '', text: '' });
  }, [passwordMessage]);

  // Handle avatar upload
  const handleAvatarUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setProfileMessage({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Submit profile changes
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setProfileMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        website: formData.website.trim(),
        location: formData.location.trim(),
        pronouns: formData.pronouns.trim(),
      };

      // Add avatar if uploaded
      if (avatarFile) {
        // In a real app, you would upload the file first
        updateData.avatar = avatarPreview;
      }

      await updateProfile(updateData);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' });
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordMessage({ 
        type: 'error', 
        text: 'Password must contain uppercase, lowercase letters and a number' 
      });
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password. Please try again.' });
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      // In a real app, you would call deleteAccount API
      console.log('Account deletion requested');
      setShowDeleteModal(false);
      // Optionally log out after deletion
      await logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Profile">
        <div className="loading-container">
          <Loader className="spinner" size={48} />
          <p>Loading your profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = ['firstName', 'lastName', 'email', 'studentId', 'department', 'graduationYear'];
    const filledFields = fields.filter(field => formData[field]?.trim());
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <DashboardLayout title="Profile Settings">
      <div className="user-profile-page">
        {/* Profile Header */}
        <div className="user-profile-header">
          <div className="avatar-section">
            <div className="avatar-container">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <User size={48} />
                </div>
              )}
              {isEditing && (
                <label className="avatar-upload-btn">
                  <Upload size={18} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="avatar-input"
                  />
                </label>
              )}
            </div>
            <div className="avatar-info">
              <h1 className="user-name">
                {user.firstName} {user.lastName}
                {user.role === 'admin' && (
                  <span className="role-badge admin">
                    <Shield size={14} />
                    Administrator
                  </span>
                )}
              </h1>
              <p className="user-email">
                <Mail size={16} />
                {user.email}
              </p>
              {user.pronouns && (
                <p className="user-pronouns">
                  {user.pronouns}
                </p>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`action-btn ${isEditing ? 'editing' : ''}`}
            >
              {isEditing ? (
                <>
                  <X size={18} />
                  Cancel Editing
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="profile-progress">
          <div className="progress-header">
            <span className="progress-label">Profile Completion</span>
            <span className="progress-percentage">{profileCompletion}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
          <p className="progress-hint">
            Complete your profile to unlock all features
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} />
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Lock size={18} />
            Security
          </button>
          <button
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <Globe size={18} />
            Account
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div className="tab-content">
            {profileMessage.text && (
              <div className={`message ${profileMessage.type}`}>
                {profileMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-section">
                <h3 className="section-title">Personal Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <User size={16} />
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="form-input"
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <User size={16} />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="form-input"
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  {/* <div className="form-group">
                    <label className="form-label">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      name="pronouns"
                      value={formData.pronouns}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="e.g., they/them, she/her"
                    />
                  </div> */}
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="form-input disabled"
                    />
                    <p className="field-note">Email cannot be changed</p>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-title">Academic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <GraduationCap size={16} />
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Enter your student ID"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <Building size={16} />
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="form-input"
                      placeholder="Your department"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} />
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                    placeholder="Expected graduation year"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={isLoading}
                  >
                    <Save size={18} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Security Tab Content */}
        {activeTab === 'security' && (
          <div className="tab-content">
            {passwordMessage.text && (
              <div className={`message ${passwordMessage.type}`}>
                {passwordMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {passwordMessage.text}
              </div>
            )}

            <div className="security-section">
              <h3 className="section-title">Password & Security</h3>
              
              <div className="security-cards">
                <div className="security-card">
                  <div className="security-card-header">
                    <Lock size={24} />
                    <h4>Change Password</h4>
                  </div>
                  <p className="security-card-description">
                    Update your password to keep your account secure
                  </p>
                  {!showPasswordForm ? (
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="btn-primary"
                    >
                      <Key size={18} />
                      Change Password
                    </button>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="password-form">
                      <div className="form-group">
                        <label className="form-label">
                          Current Password
                        </label>
                        <div className="password-input-wrapper">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          New Password
                        </label>
                        <div className="password-input-wrapper">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <div className="password-strength">
                          <div className={`strength-indicator ${passwordData.newPassword.length >= 8 ? 'strong' : 'weak'}`} />
                          <span className="strength-text">
                            {passwordData.newPassword.length >= 8 ? 'Strong password' : 'Weak password'}
                          </span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          Confirm New Password
                        </label>
                        <div className="password-input-wrapper">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="form-input"
                            required
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                            setPasswordMessage({ type: '', text: '' });
                          }}
                          className="btn-secondary"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Changing...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                <div className="security-card">
                  <div className="security-card-header">
                    <Shield size={24} />
                    <h4>Two-Factor Authentication</h4>
                  </div>
                  <p className="security-card-description">
                    Add an extra layer of security to your account
                  </p>
                  <button
                    className="btn-secondary"
                    onClick={() => console.log('Enable 2FA')}
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab Content */}
        {activeTab === 'account' && (
          <div className="tab-content">
            <div className="account-section">
              <h3 className="section-title">Account Settings</h3>
              
              <div className="account-options">
                <div className="account-option">
                  <div className="option-info">
                    <h4>Delete Account</h4>
                    <p>Permanently delete your account and all associated data</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-danger"
                  >
                    <Trash2 size={18} />
                    Delete Account
                  </button>
                </div>

                <div className="account-option">
                  <div className="option-info">
                    <h4>Log Out</h4>
                    <p>Sign out from all devices</p>
                  </div>
                  <button
                    onClick={logout}
                    className="btn-secondary"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Account"
          size="sm"
        >
          <div className="delete-modal-content">
            <AlertCircle size={48} color="#ef4444" />
            <h3>Are you absolutely sure?</h3>
            <p className="warning-text">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;