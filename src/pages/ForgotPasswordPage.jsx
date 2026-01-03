import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import './LoginPage.css';

const ForgotPasswordPage = () => { 
  const navigate = useNavigate();
  const { isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // TODO: Implement password reset request
      setMessage('Password reset instructions have been sent to your email.');
      setStep(2);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    } 

    try {
      // TODO: Implement OTP verification
      setStep(3);
    } catch (err) {
      setError('Invalid OTP code. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // TODO: Implement password reset
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <button
            onClick={() => navigate('/login')}
            className="back-to-login-btn"
          >
            <ArrowLeft size={20} />
            Back to Login
          </button>

          {step === 1 && (
            <>
              <div className="auth-header">
                <h1>Reset Password</h1>
                <p>Enter your email address and we'll send you a reset code</p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-success">{message}</div>}

              <form onSubmit={handleRequestReset} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                      className={error && !email ? 'error' : ''}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-header">
                <h1>Enter Reset Code</h1>
                <p>We've sent a 6-digit code to {email}</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp">OTP Code</label>
                  <input
                    type="text"
                    id="otp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(value);
                    }}
                    placeholder="000000"
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className={`otp-input ${error && !otpCode ? 'error' : ''}`}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-button-secondary"
                  disabled={isLoading}
                >
                  Back
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-header">
                <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                <h1>New Password</h1>
                <p>Enter your new password</p>
              </div>

              {error && <div className="auth-error">{error}</div>}
              {message && <div className="auth-success">{message}</div>}

              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"  
                    id="newPassword" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={isLoading}
                    className={error && !newPassword ? 'error' : ''}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isLoading}
                    className={error && newPassword !== confirmPassword ? 'error' : ''}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

