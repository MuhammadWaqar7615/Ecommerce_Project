import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { register, loginWithGoogle } from '../../services/auth';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validateForm';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'customer';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: defaultRole,
  });
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.trim() === '') return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const validateFullName = (fullName) => {
    if (!fullName || fullName.trim() === '') return 'Full name is required';
    if (fullName.trim().length < 2) return 'Full name must be at least 2 characters';
    return '';
  };

  const validateEmailField = (email) => {
    if (!email) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePasswordField = (password) => {
    if (!password) return 'Password is required';
    if (!validatePassword(password)) return 'Password must be at least 6 characters';
    return '';
  };

  const validatePhoneField = (phone) => {
    if (phone && phone.trim() !== '' && !validatePhone(phone)) {
      return 'Please enter a valid phone number (10-15 digits)';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleGoogleSignup = () => loginWithGoogle();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(s => !s);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Validate all fields on submit
    const errors = {
      username: validateUsername(formData.username),
      fullName: validateFullName(formData.fullName),
      email: validateEmailField(formData.email),
      password: validatePasswordField(formData.password),
      phone: validatePhoneField(formData.phone),
    };
    setFieldErrors(errors);
    
    // Check if any validation error exists
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) {
      // Find first field with error
      const firstErrorField = Object.keys(errors).find(key => errors[key] !== '');
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      });

      setRegistrationSuccess(true);
      setApiError('');

      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(formData.email)}&status=sent`
        );
      }, 3000);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // Helper to get non-empty error messages for summary
  const getErrorSummary = () => {
    return Object.entries(fieldErrors).filter(([_, msg]) => msg !== '');
  };

  const errorSummary = getErrorSummary();

  return (
    <div className="min-h-screen auth-hero mt-10">
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
                <p className="mt-2 text-center text-sm text-gray-600">
                  Or <Link to="/login" className="font-medium text-primary hover:underline">sign in to existing account</Link>
                </p>
              </div>

              {/* Registration success message */}
              {registrationSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Registration successful! Please check your email to verify your account. Redirecting to verification page in a moment...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* API error banner */}
              {apiError && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{apiError}</p>
                    </div>
                  </div>
                </div>
              )}


              {!registrationSuccess && (
                <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                  {/* Row 1: Username and Full Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        maxLength={50}
                        placeholder="cooluser123"
                        value={formData.username}
                        onChange={handleChange}
                        className={`input-field ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                        aria-invalid={!!fieldErrors.username}
                      />
                      {fieldErrors.username && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        id="fullName"
                        name="fullName"
                        maxlength={100}
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`input-field ${fieldErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                        aria-invalid={!!fieldErrors.fullName}
                      />
                      {fieldErrors.fullName && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        id="email"
                        name="email"
                        maxLength={100}
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input-field ${fieldErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                        aria-invalid={!!fieldErrors.email}
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        id="phone"
                        name="phone"
                        maxLength={15}
                        type="tel"
                        placeholder="03001234567"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field ${fieldErrors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                        aria-invalid={!!fieldErrors.phone}
                      />
                      {fieldErrors.phone && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Password and Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          maxLength={100}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={formData.password}
                          onChange={handleChange}
                          className={`input-field w-full pr-10 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                          aria-invalid={!!fieldErrors.password}
                        />
                        <button
                          type="button"
                          onClick={toggleShowPassword}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">Register as</label>
                      <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <button type="submit" disabled={loading} className="btn-primary w-full">
                      {loading ? 'Creating account...' : 'Register'}
                    </button>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      disabled={loading}
                      className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Continue with Google
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-500">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
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