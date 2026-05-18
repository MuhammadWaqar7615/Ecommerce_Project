import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, loginWithGoogle } from '../../services/auth';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validateForm';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    loginWithGoogle();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((s) => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username || formData.email.split('@')[0],
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role,
      });

      setRegistrationSuccess(true);
      setError('');

      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(formData.email)}&status=sent`
        );
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-hero">
      <div className="min-h-screen flex items-center">
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 px-4">
          <div className="hidden md:block auth-panel-left text-white">
            <p className="uppercase text-sm tracking-widest text-white/80">Crafts & Delights</p>
            <h1 className="mt-6 text-4xl font-extrabold">Start selling or shopping today</h1>
            <p className="mt-4 text-lg text-white/90">Create your account with a premium experience. Register as a customer or vendor in minutes.</p>
          </div>

          <div className="mx-auto w-full max-w-md auth-card p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 text-center">Create your account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">Or <Link to="/login" className="font-medium text-primary hover:underline">sign in to existing account</Link></p>
              </div>

              {registrationSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">Registration successful! Please check your email to verify your account. Redirecting to verification page...</p>
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

              {!registrationSuccess && (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input id="fullName" name="fullName" type="text" required placeholder="John Doe" value={formData.fullName} onChange={handleChange} className="input-field" />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                    <input id="email" name="email" type="email" required placeholder="you@email.com" value={formData.email} onChange={handleChange} className="input-field" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                    <input id="phone" name="phone" type="tel" placeholder="03001234567" value={formData.phone} onChange={handleChange} className="input-field" />
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} className="input-field pr-12" />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={toggleShowPassword} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register as</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  <div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Register'}</button>
                  </div>

                  <div>
                    <button type="button" onClick={handleGoogleSignup} disabled={loading} className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Continue with Google</button>
                  </div>

                  <p className="text-center text-xs text-gray-500">By registering, you agree to our Terms of Service and Privacy Policy</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;