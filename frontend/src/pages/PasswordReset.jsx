import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPasswordWithLink, sendPasswordResetLink } from '../services/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((s) => !s);
  const toggleShowConfirmPassword = () => setShowConfirmPassword((s) => !s);

  useEffect(() => {
    // Check if reset token is in URL
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setStep('reset');
    }
  }, [searchParams]);

  const handleSendResetLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetLink(email);
      setMessage(
        'Password reset link sent! Please check your email to reset your password.'
      );
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPasswordWithLink(token, password, confirmPassword);
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'request') {
    return (
      <div className="min-h-screen auth-hero">
        <div className="min-h-screen flex items-center">
          <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-4">
            <div className="hidden md:block auth-panel-left text-white">
              <p className="uppercase text-sm tracking-widest text-white/80">Crafts & Delights</p>
              <h1 className="mt-6 text-4xl font-extrabold">Reset Your Password</h1>
              <p className="mt-4 text-lg text-white/90">Enter your email and we will send you a link to reset your password securely.</p>
            </div>

            <div className="mx-auto w-full max-w-md auth-card p-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 text-center">Reset Your Password</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Enter your email address and we'll send you a link to reset your password</p>
              </div>

              {message && (<div className="rounded-md bg-green-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-green-800">{message}</p></div></div></div>)}
              {error && (<div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>)}

              {!message && (
                <form className="mt-6 space-y-4" onSubmit={handleSendResetLink}>
                  <div>
                    <label htmlFor="email" className="sr-only">Email address</label>
                    <input id="email" name="email" type="email" autoComplete="email" required className="input-field" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                  </div>

                  <div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    <p>Remember your password? <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">Log in here</button></p>
                  </div>
                </form>
              )}

              {message && (<div className="text-center text-sm text-gray-600"><button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">Back to Login</button></div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form (step = 'reset')
  return (
    <div className="min-h-screen auth-hero">
      <div className="min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-4">
          <div className="hidden md:block auth-panel-left text-white">
            <p className="uppercase text-sm tracking-widest text-white/80">Crafts & Delights</p>
            <h1 className="mt-6 text-4xl font-extrabold">Set a new secure password</h1>
            <p className="mt-4 text-lg text-white/90">Choose a strong password to keep your account safe.</p>
          </div>

          <div className="mx-auto w-full max-w-md auth-card p-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 text-center">Set New Password</h2>
              <p className="mt-2 text-center text-sm text-gray-600">Enter your new password below</p>
            </div>

            {message && (<div className="rounded-md bg-green-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-green-800">{message}</p></div></div></div>)}
            {error && (<div className="rounded-md bg-red-50 p-4"><div className="flex"><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>)}

            {!message && (
              <form className="mt-6 space-y-4" onSubmit={handleResetPassword}>
                <div className="relative">
                  <label htmlFor="password" className="sr-only">New Password</label>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="input-field pr-12" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={toggleShowPassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required className="input-field pr-12" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
                  <button type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={toggleShowConfirmPassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">Back to Login</button>
                </div>
              </form>
            )}

            {message && (<div className="text-center text-sm text-gray-600"><button onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">Go to Login</button></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
