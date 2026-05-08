# Passport.js Authentication Implementation Guide

## Overview
Your e-commerce platform has been successfully migrated from JWT-only authentication to a comprehensive **Passport.js-based authentication system** with:
- ✅ Email verification on manual registration
- ✅ Google OAuth 2.0 integration
- ✅ Magic link-based password reset (no OTP)
- ✅ Gmail SMTP email delivery

---

## 🚀 Quick Start

### 1. Configure Environment Variables

Edit `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/crafts_delights

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=noreply@craftsdelights.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_client_id_from_google_console
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_from_google_console
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

### 2. Generate Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled
3. Go to "App passwords" (or search for it)
4. Select "Mail" and "Windows Computer" (or your device)
5. Google will generate a 16-character password
6. Use this in `EMAIL_PASS` (remove spaces)

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable OAuth 2.0 API
4. Create OAuth 2.0 credentials (Web Application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/auth/google/callback` (development)
   - Your production domain when deploying
6. Copy Client ID and Client Secret to `.env`

### 4. Start the Servers

**Backend:**
```bash
cd backend
npm install  # If not already done
npm run dev  # Starts with nodemon
```

**Frontend:**
```bash
cd frontend
npm install  # If not already done
npm run dev  # Starts Vite dev server
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "minLength6",
  "fullName": "John Doe",
  "phone": "03001234567",
  "role": "customer"  // or "vendor"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "isEmailVerified": false,
      ...
    }
  },
  "message": "Registration successful! Please check your email to verify your account."
}
```

#### Send Verification Email
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}

Response includes JWT token and user data
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userPassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

#### Google OAuth
```http
GET /auth/google
```
Redirects user to Google consent screen. After approval, redirects to frontend with token in URL.

#### Password Reset - Send Link
```http
POST /api/auth/send-reset-link
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset - Reset with Link
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your_jwt_token
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your_jwt_token
```

---

## 🔄 User Registration Flow

```
1. User clicks "Register"
   ↓
2. Fill form (email, password, name, phone)
   ↓
3. Submit registration
   ↓
4. Backend creates user with isEmailVerified: false
   ↓
5. Email sent with verification link (24-hour expiry)
   ↓
6. User clicks email link
   ↓
7. Email verified, welcome email sent
   ↓
8. User can now login
```

---

## 🔐 Google OAuth Flow

```
1. User clicks "Sign in with Google" button
   ↓
2. Redirected to Google consent screen
   ↓
3. User grants permissions
   ↓
4. Backend creates/updates user account
   ↓
5. JWT token generated
   ↓
6. Redirected to /auth-callback with token in URL
   ↓
7. Frontend stores token and logs user in
   ↓
8. Redirect to dashboard
```

---

## 🔑 Password Reset Flow

```
1. User clicks "Forgot password" on login page
   ↓
2. Enters email address
   ↓
3. Backend generates magic link token (1-hour expiry)
   ↓
4. Email sent with reset link
   ↓
5. User clicks link in email
   ↓
6. Taken to password reset page
   ↓
7. User enters new password
   ↓
8. Password updated in database
   ↓
9. User can login with new password
```

---

## 📁 Key Files Changed

### Backend
- `config/passport.js` - NEW: Passport strategies
- `config/nodemailer.js` - UPDATED: Gmail SMTP
- `models/User.js` - UPDATED: New auth fields
- `controllers/authController.js` - REWRITTEN: All auth logic
- `routes/authRoutes.js` - UPDATED: New endpoints
- `middleware/authMiddleware.js` - UPDATED: Passport JWT
- `validations/authValidation.js` - UPDATED: New validations
- `services/emailService.js` - UPDATED: Magic link emails

### Frontend
- `src/services/auth.js` - REWRITTEN: Auth API calls
- `src/context/AuthContext.jsx` - UPDATED: Auth state
- `src/components/auth/Login.jsx` - UPDATED: Email login + Google button
- `src/components/auth/Register.jsx` - UPDATED: No auto-login
- `src/pages/EmailVerification.jsx` - NEW: Email verification
- `src/pages/PasswordReset.jsx` - NEW: Password reset
- `src/pages/AuthCallback.jsx` - NEW: Google OAuth callback

---

## 🧪 Testing the Implementation

### Manual Registration & Email Verification
1. Navigate to http://localhost:3000/register
2. Fill form with test data
3. Click "Register"
4. Check console logs or backend for verification link (dev mode prints to console)
5. Copy token from verification link
6. Go to http://localhost:3000/verify-email
7. Email should be verified
8. Login should now work

### Google OAuth Testing
1. Navigate to http://localhost:3000/login
2. Click "Sign in with Google"
3. Select Google account to use
4. Grant permissions
5. Should be redirected to dashboard with token

### Password Reset Testing
1. Navigate to http://localhost:3000/reset-password
2. Enter registered email
3. Check console/backend for reset link
4. Copy token and navigate to reset link
5. Enter new password
6. Login with new password

---

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs (10 rounds)
- ✅ JWT token expiration (7 days by default)
- ✅ Magic link tokens with time-limited expiry
- ✅ Email verification before login
- ✅ OAuth automatic account linking
- ✅ CORS protection
- ✅ Express validator middleware
- ✅ Rate limiting on auth endpoints

---

## ⚙️ Important Configuration Notes

### Token Expiry
- **JWT Token**: 7 days (set in `.env` as `JWT_EXPIRE=7d`)
- **Email Verification Link**: 24 hours
- **Password Reset Link**: 1 hour

### Email Verification
- Local users must verify email before login
- OAuth users are auto-verified
- Verification email expires after 24 hours

### Password Reset
- Reset link valid for 1 hour only
- Each request generates new token
- Old tokens become invalid

### Role-Based Access
- Supported roles: `customer`, `vendor`, `admin`
- Existing middleware respects new user structure
- All protected routes use Passport JWT strategy

---

## 🚨 Troubleshooting

### Email Not Sending
1. Check Gmail credentials in `.env`
2. Verify app password (not regular Gmail password)
3. Check backend console for error messages
4. Ensure 2FA is enabled on Gmail account

### OAuth Not Working
1. Verify Client ID and Secret are correct
2. Check redirect URI matches exactly
3. Ensure OAuth API is enabled in Google Cloud Console
4. Check CORS configuration

### Token Issues
1. Tokens stored in localStorage (check browser DevTools)
2. Token must be included in `Authorization: Bearer <token>` header
3. Token expires after set duration in `.env`
4. Clear localStorage if issues persist

### Frontend Not Receiving Token After Google Auth
1. Ensure FRONTEND_URL in `.env` is correct
2. Check browser console for errors
3. Verify redirect URL structure in OAuth callback

---

## 📦 Database Schema Changes

### User Model Updates
```javascript
{
  // Existing fields
  username: String,
  email: String,
  password: String (now optional),
  fullName: String,
  phone: String,
  role: String,
  
  // New fields
  provider: 'local' | 'google',
  providerId: String,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  // For password reset
  magicLinkToken: String,
  magicLinkExpire: Date,
}
```

---

## 🔄 Migration from Old System

This is a **fresh implementation**:
- Existing users are NOT automatically migrated
- Old auth tokens won't work with new system
- Demo accounts need to be recreated with new flow

### To create demo accounts:
1. Register through new system
2. Verify email (check console logs in dev mode)
3. Account ready to use

---

## 📝 Next Steps

1. **Test all auth flows thoroughly**
2. **Set up MongoDB if not already done**
3. **Configure Gmail with app password**
4. **Set up Google OAuth credentials**
5. **Test email delivery**
6. **Deploy to production** with proper environment variables
7. **Update any existing client code** using old `/auth/login` format

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Check backend console logs
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Check email configuration

---

Last Updated: May 8, 2026
Version: 1.0.0 (Passport.js Integration)
