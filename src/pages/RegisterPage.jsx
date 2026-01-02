import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useIsAuthenticated, useIsAdmin } from '../store/useAuthStore';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, verifyOTP, resendOTP, isLoading, error, clearError } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();

  const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
    department: '',
    graduationYear: '',
  });

  const [otpData, setOtpData] = useState({
    email: '',
    otpCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/users/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    setLocalError('');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (localError || error) {
      setLocalError('');
      clearError();
    }
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    // Only allow numeric input for OTP code
    if (name === 'otpCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setOtpData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setOtpData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (localError || error) {
      setLocalError('');
      clearError();
    }
  };

  const validateRegistrationForm = () => {
    if (!formData.firstName.trim()) {
      setLocalError('First name is required');
      return false;
    }
    if (formData.firstName.trim().length < 2) {
      setLocalError('First name must be at least 2 characters');
      return false;
    }
    if (!formData.lastName.trim()) {
      setLocalError('Last name is required');
      return false;
    }
    if (formData.lastName.trim().length < 2) {
      setLocalError('Last name must be at least 2 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    // Backend requires: uppercase, lowercase, and number
    if (!/[A-Z]/.test(formData.password)) {
      setLocalError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setLocalError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setLocalError('Password must contain at least one number');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return false;
    }
    if (!formData.studentId.trim()) {
      setLocalError('Student ID is required');
      return false;
    }
    // Student ID can only contain letters and numbers
    if (!/^[A-Za-z0-9]+$/.test(formData.studentId.trim())) {
      setLocalError('Student ID can only contain letters and numbers');
      return false;
    }
    if (!formData.department.trim()) {
      setLocalError('Department is required');
      return false;
    }
    if (!formData.graduationYear) {
      setLocalError('Graduation year is required');
      return false;
    }
    const year = parseInt(formData.graduationYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear || year > currentYear + 10) {
      setLocalError('Please enter a valid graduation year');
      return false;
    }
    return true;
  };

  const validateOTPForm = () => {
    if (!otpData.otpCode.trim()) {
      setLocalError('OTP code is required');
      return false;
    }
    if (otpData.otpCode.trim().length !== 6) {
      setLocalError('OTP code must be 6 digits');
      return false;
    }
    return true;
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateRegistrationForm()) {
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        graduationYear: parseInt(formData.graduationYear),
      };

      const response = await register(registrationData);

      if (response && response.success) {
        setOtpData((prev) => ({
          ...prev,
          email: formData.email.trim().toLowerCase(),
        }));
        setStep(2);
      } else {
        // If response exists but not successful, error is already set by store
        if (response && !response.success) {
          setLocalError(response.message || 'Registration failed');
        }
      }
    } catch (err) {
      // Error is handled by the store, but we can also set local error
      console.error('Registration catch error:', err);
      if (err?.error?.message) {
        setLocalError(err.error.message);
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validateOTPForm()) {
      return;
    }

    try {
      await verifyOTP(otpData.email, otpData.otpCode);
      // Navigation will happen automatically via useEffect when isAuthenticated changes
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleResendOTP = async () => {
    setLocalError('');
    try {
      await resendOTP(otpData.email);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {step === 1 ? (
            <>
              <div className="auth-header">
                <h1>Create Account</h1>
                <p>Sign up to get started with event management</p>
              </div>

              {(error || localError) && (
                <div className="auth-error">
                  {error || localError}
                </div>
              )}

              <form onSubmit={handleRegistrationSubmit} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      required
                      disabled={isLoading}
                      className={localError && !formData.firstName ? 'error' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      required
                      disabled={isLoading}
                      className={localError && !formData.lastName ? 'error' : ''}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@university.edu"
                    required
                    disabled={isLoading}
                    className={localError && !formData.email ? 'error' : ''}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        required
                        disabled={isLoading}
                        className={localError && !formData.password ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <p className="password-hint">
                      Must contain: uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        disabled={isLoading}
                        className={localError && formData.password !== formData.confirmPassword ? 'error' : ''}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="22316021 or STU22316021"
                    required
                    disabled={isLoading}
                    pattern="[A-Za-z0-9]+"
                    title="Student ID can only contain letters and numbers"
                    className={localError && (!formData.studentId || !/^[A-Za-z0-9]+$/.test(formData.studentId)) ? 'error' : ''}
                  />
                  <p className="field-hint">
                    Numbers only (e.g., 22316021) or letters and numbers (e.g., STU22316021)
                  </p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      required
                      disabled={isLoading}
                      className={localError && !formData.department ? 'error' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Graduation Year</label>
                    <input
                      type="number"
                      id="graduationYear"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="2025"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 10}
                      required
                      disabled={isLoading}
                      className={localError && !formData.graduationYear ? 'error' : ''}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="button-loading">
                      <span className="spinner-small"></span>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <h1>Verify Your Email</h1>
                <p>We've sent a 6-digit code to {otpData.email}</p>
              </div>

              {(error || localError) && (
                <div className="auth-error">
                  {error || localError}
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otpCode">Enter OTP Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="otpCode"
                    name="otpCode"
                    value={otpData.otpCode}
                    onChange={handleOtpChange}
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className={`otp-input ${localError && !otpData.otpCode ? 'error' : ''}`}
                    autoComplete="one-time-code"
                  />
                  <p className="otp-hint">Enter the 6-digit code sent to your email</p>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="button-loading">
                      <span className="spinner-small"></span>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <button
                  type="button"
                  className="auth-button-secondary"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  className="auth-button-text"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  ← Back to registration
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
