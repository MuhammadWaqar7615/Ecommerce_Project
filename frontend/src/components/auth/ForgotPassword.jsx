import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendResetOTP, verifyOTP, resetPassword, resendOTP } from '../../services/password';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const startCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await sendResetOTP(email);
      setSuccess('OTP sent to your email! Check your inbox.');
      setStep(2);
      startCountdown();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await verifyOTP(email, otp);
      setSuccess('OTP verified! Now set your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    try {
      await resendOTP(email);
      setSuccess('New OTP sent to your email!');
      startCountdown();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary">Crafts & Delights</h2>
          <p className="text-gray-600 mt-2">
            {step === 1 && 'Reset your password'}
            {step === 2 && 'Enter verification code'}
            {step === 3 && 'Create new password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll send a 6-digit verification code to this email
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary hover:underline text-sm">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code sent to {email}
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn-primary w-full mb-3 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendDisabled}
                className="text-primary hover:underline text-sm disabled:opacity-50"
              >
                {resendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;