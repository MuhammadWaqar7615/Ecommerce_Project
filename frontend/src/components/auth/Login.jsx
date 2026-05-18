import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login, loginWithGoogle } from '../../services/auth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: loginUser, setError: setAuthError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);

    if (!identifier.trim()) {
      setError('Please enter your email or username');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login with:', identifier);
      const data = await login(identifier, password);
      console.log('Login response data:', data);

      if (data && data.user) {
        if (!data.user.isEmailVerified) {
          setError('Your email is not verified yet. Check your inbox for the verification email.');
          setTimeout(() => {
            navigate(`/verify-email?email=${encodeURIComponent(data.user.email)}&status=sent`);
          }, 1800);
          setLoading(false);
          return;
        }

        loginUser(data.user, data.token);

        if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (data.user.role === 'vendor') {
          window.location.href = '/vendor/dashboard';
        } else if (data.user.role === 'customer') {
          window.location.href = '/customer/dashboard';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      console.error('Login error caught:', err);
      setError(
        err.message ||
          'Unable to sign in. Please check your email/username and password and try again.'
      );
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
    } catch (err) {
      setError('Failed to initiate Google login');
      console.error(err);
    }
  };

  // Reset error when user types
  const handleInputChange = (e) => {
    setError('');
    if (e.target.name === 'identifier') {
      setIdentifier(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((s) => !s);

  return (
    <div className="min-h-screen auth-hero">
      <div className="min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-4">
          <div className="hidden md:block auth-panel-left text-white">
            <p className="uppercase text-sm tracking-widest text-white/80">Crafts & Delights</p>
            <h1 className="mt-6 text-4xl font-extrabold">Welcome back to the marketplace</h1>
            <p className="mt-4 text-lg text-white/90">Sign in to manage your orders, browse new arrivals, and keep your storefront up to date.</p>
          </div>

          <div className="mx-auto w-full max-w-md auth-card p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 text-center">Sign in to your account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Or <Link to="/register" className="font-medium text-primary hover:underline">create a new account</Link></p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                    <button type="button" className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>
                      <span className="text-xl">&times;</span>
                    </button>
                  </div>
                )}

                <div>
                  <label htmlFor="identifier" className="sr-only">Email or Username</label>
                  <input id="identifier" name="identifier" type="text" required placeholder="Email or Username" value={identifier} onChange={handleInputChange} className="input-field" />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} required placeholder="Password" value={password} onChange={handleInputChange} className="input-field pr-12" />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={toggleShowPassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Sign in'}</button>
                </div>

                <div>
                  <button type="button" onClick={handleGoogleLogin} disabled={loading} className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"> <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/></svg>
                    Sign in with Google
                  </button>
                </div>

                <div className="text-center">
                  <Link to="/reset-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                </div>

                <div className="text-center text-xs text-gray-400 border-t pt-4">
                  <p>Demo Accounts (after email verification):</p>
                  <p>Admin: admin@craftsdelights.com / admin123</p>
                  <p>Vendor: vendor@test.com / 123456</p>
                  <p>Customer: test@example.com / 123456</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;