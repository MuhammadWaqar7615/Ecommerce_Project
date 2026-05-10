import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, sendVerificationLink } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setErrorState] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    const status = searchParams.get('status');
    const emailParam = searchParams.get('email');

    if (status === 'sent') {
      const decodedEmail = emailParam ? decodeURIComponent(emailParam) : '';
      setMessage(
        decodedEmail
          ? `Verification email sent to ${decodedEmail}. Please check your inbox and spam folder.`
          : 'Verification email sent! Please check your inbox and spam folder.'
      );
    }

    if (urlToken) {
      setToken(urlToken);
      verifyEmailToken(urlToken);
    }
  }, [searchParams]);

  const verifyEmailToken = async (verificationToken) => {
    setVerifying(true);
    setErrorState('');
    setMessage('');
    try {
      const response = await verifyEmail(verificationToken);
      setMessage('Email verified successfully! Logging you in...');
      if (response.user && response.token) {
        login(response.user, response.token);
        setTimeout(() => {
          if (response.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (response.user.role === 'vendor') {
            navigate('/vendor/dashboard');
          } else {
            navigate('/');
          }
        }, 1500);
      }
    } catch (err) {
      setErrorState(err.message || 'Verification failed. Please try again.');
      setMessage('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorState('Please enter your email address');
      return;
    }

    setLoading(true);
    setErrorState('');
    setMessage('');
    try {
      await sendVerificationLink(email);
      setMessage('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (err) {
      setErrorState(err.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please verify your email to complete registration
          </p>
        </div>

        {verifying && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Verifying your email...
                </p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!verifying && !token && (
          <form className="mt-8 space-y-6" onSubmit={handleResendEmail}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Already verified?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Log in here
                </button>
              </p>
            </div>
          </form>
        )}

        {message && token && (
          <div className="text-center text-sm text-gray-600">
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
