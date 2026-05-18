import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetLink } from '../../services/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Send password reset link
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await sendPasswordResetLink(email);
      setSuccess('Password reset link sent! Check your email and click the link to reset your password.');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-hero">
      <div className="min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-4">
          <div className="hidden md:block auth-panel-left text-white">
            <p className="uppercase text-sm tracking-widest text-white/80">Crafts & Delights</p>
            <h1 className="mt-6 text-4xl font-extrabold">Forgot your password?</h1>
            <p className="mt-4 text-lg text-white/90">Enter your email and we’ll send a secure link so you can reset it quickly.</p>
          </div>

          <div className="mx-auto w-full max-w-md auth-card p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-dark">Reset your password</h2>
              <p className="text-gray-600 mt-2">Enter your email to receive a password reset link.</p>
            </div>

            {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>)}
            {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">{success}</div>)}

            <form onSubmit={handleSendResetLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" required className="input-field" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <p className="text-xs text-gray-500 mt-1">We'll send a password reset link to this email</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-primary hover:underline text-sm">← Back to Login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;