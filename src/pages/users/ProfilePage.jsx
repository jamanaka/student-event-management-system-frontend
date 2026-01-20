import React, { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Calendar, Save, Lock, Eye, EyeOff, X } from 'lucide-react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import '../../css/admin/ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    graduationYear: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        studentId: user.studentId || '',
        department: user.department || '',
        graduationYear: user.graduationYear?.toString() || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (profileMessage) setProfileMessage('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    if (passwordMessage) setPasswordMessage('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');

    try {
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
      };

      await updateProfile(updateData);
      setProfileMessage('success:Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (error) {
      setProfileMessage('error:Failed to update profile. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('error:All password fields are required.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('error:New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('error:Password must be at least 6 characters long.');
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordMessage('success:Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      // Error is already handled by the store's toast
      setPasswordMessage('error:Failed to change password. Please try again.');
    }
  };

  if (!user) {
    return (
      <DashboardLayout title="Profile">
        <div className="loading-state">Loading...</div>
      </DashboardLayout>
    );
  }

  const profileMsgType = profileMessage.split(':')[0];
  const profileMsgText = profileMessage.split(':')[1] || profileMessage;

  const passwordMsgType = passwordMessage.split(':')[0];
  const passwordMsgText = passwordMessage.split(':')[1] || passwordMessage;

  return (
    <DashboardLayout title="Settings">
      <div className="profile-page">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={40} /> 
          </div>
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="user-email">
              <Mail size={16} />
              {user.email}
            </p>
            {user.role === 'admin' && (
              <span className="role-badge">Administrator</span>
            )}
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <User size={22} />
              Profile Information
            </h2>
          </div>

          {profileMessage && (
            <div className={`message ${profileMsgType === 'success' ? 'success' : 'error'}`}>
              {profileMsgText}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="form-input disabled"
                />
                <p className="field-hint">Email cannot be changed</p>
              </div>
            </div>

            <div className="form-section">
              <h3 className="subsection-title">Academic Information</h3>

              <div className="form-group">
                <label htmlFor="studentId" className="form-label">
                  <GraduationCap size={16} />
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department" className="form-label">
                    <GraduationCap size={16} />
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="graduationYear" className="form-label">
                    <Calendar size={16} />
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="form-input"
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 10}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  <Save size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        studentId: user.studentId || '',
                        department: user.department || '',
                        graduationYear: user.graduationYear?.toString() || '',
                      });
                    }}
                    className="btn-cancel"
                    disabled={isLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={isLoading}
                  >
                    <Save size={18} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2 className="section-title">
              <Lock size={22} />
              Security
            </h2>
            {!showPasswordForm && (
              <button
                type="button"
                onClick={() => setShowPasswordForm(true)}
                className="btn-secondary"
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div className="password-form-container">
              {passwordMessage && (
                <div className={`message ${passwordMsgType === 'success' ? 'success' : 'error'}`}>
                  {passwordMsgText}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    <Lock size={16} />
                    Current Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    <Lock size={16} />
                    New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="field-hint">Must be at least 6 characters with uppercase, lowercase, and number</p>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <Lock size={16} />
                    Confirm New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="form-input"
                      required
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
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
                      setPasswordMessage('');
                    }}
                    className="btn-cancel"
                    disabled={isLoading}
                  >
                    <X size={18} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={isLoading}
                  >
                    <Lock size={18} />
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
