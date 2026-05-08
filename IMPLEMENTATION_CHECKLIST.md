# Implementation Checklist & Quick Setup

## ✅ Pre-Deployment Checklist

### Backend Setup
- [ ] Install Passport.js dependencies: `npm install` (already done)
- [ ] Copy `.env.example` to `.env` (or update existing `.env`)
- [ ] Set up MongoDB connection in `MONGODB_URI`
- [ ] Generate JWT_SECRET (use strong random string)
- [ ] Configure Gmail credentials:
  - [ ] Enable 2FA on Gmail account
  - [ ] Generate app password
  - [ ] Add to `EMAIL_USER` and `EMAIL_PASS`
- [ ] Set up Google OAuth:
  - [ ] Create Google Cloud project
  - [ ] Generate OAuth credentials
  - [ ] Add Client ID and Secret to `.env`
  - [ ] Add redirect URI to Google Console
- [ ] Set `FRONTEND_URL` correctly
- [ ] Set `NODE_ENV=development` for testing

### Frontend Setup
- [ ] Ensure `REACT_APP_API_URL` is set (if using environment variables)
- [ ] Frontend API base URL matches backend URL
- [ ] All new pages are imported in routing
- [ ] AuthContext wraps entire app

---

## 🚀 Running the Application

### Terminal 1: Backend
```bash
cd backend
npm run dev
# Server should start on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Server should start on http://localhost:3000
```

### Terminal 3: MongoDB (if running locally)
```bash
mongod
# MongoDB runs on mongodb://localhost:27017
```

---

## 🧪 Testing Scenarios

### Test 1: Manual Registration
1. Go to `http://localhost:3000/register`
2. Fill form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Phone: 03001234567
   - Role: Customer
3. Click "Register"
4. Check backend console for verification token
5. Copy token (format: long hex string)
6. Go to `http://localhost:3000/verify-email`
7. Paste token and verify
8. Should see success message
9. Go to login and try with credentials

### Test 2: Google OAuth
1. Ensure Google OAuth credentials are in `.env`
2. Go to `http://localhost:3000/login`
3. Click "Sign in with Google"
4. Select Google account
5. Grant permissions
6. Should redirect to dashboard or home page

### Test 3: Password Reset
1. Go to `http://localhost:3000/reset-password`
2. Enter registered email
3. Check backend console for reset token
4. Copy token
5. Go to reset password page with token
6. Set new password
7. Try logging in with new password

### Test 4: Protected Routes
1. After login, access `/api/auth/me` should return user data
2. Try accessing admin routes without admin role (should fail)
3. Try accessing protected routes without token (should fail)

---

## 📊 Expected File Structure

```
backend/
├── config/
│   ├── passport.js          ✨ NEW
│   ├── nodemailer.js        ✏️ UPDATED
│   ├── db.js
│   └── ...
├── controllers/
│   ├── authController.js    ✏️ REWRITTEN
│   └── ...
├── models/
│   ├── User.js              ✏️ UPDATED
│   └── ...
├── routes/
│   ├── authRoutes.js        ✏️ UPDATED
│   └── ...
├── middleware/
│   ├── authMiddleware.js    ✏️ UPDATED
│   └── ...
├── services/
│   ├── emailService.js      ✏️ UPDATED
│   └── ...
├── validations/
│   ├── authValidation.js    ✏️ UPDATED
│   └── ...
├── .env
├── server.js                ✏️ UPDATED
└── package.json             ✏️ UPDATED (new deps)

frontend/
├── src/
│   ├── pages/
│   │   ├── EmailVerification.jsx    ✨ NEW
│   │   ├── PasswordReset.jsx        ✨ NEW
│   │   ├── AuthCallback.jsx         ✨ NEW
│   │   └── ...
│   ├── components/auth/
│   │   ├── Login.jsx                ✏️ UPDATED
│   │   ├── Register.jsx             ✏️ UPDATED
│   │   └── ...
│   ├── services/
│   │   ├── auth.js                  ✏️ REWRITTEN
│   │   └── ...
│   ├── context/
│   │   ├── AuthContext.jsx          ✏️ UPDATED
│   │   └── ...
│   └── App.jsx                      (needs routing updates)
└── package.json

AUTHENTICATION_GUIDE.md              ✨ NEW
IMPLEMENTATION_CHECKLIST.md          ✨ NEW (this file)
```

---

## 🔧 Environment Template

Copy this to your `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/crafts_delights

# JWT
JWT_SECRET=your_secure_random_string_here_minimum_32_chars
JWT_EXPIRE=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=noreply@craftsdelights.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Stripe (existing)
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

---

## 🗺️ Frontend Routing Updates Required

Make sure these routes exist in your main routing file (App.jsx or Router):

```jsx
// Add these new routes
<Route path="/register" element={<Register />} />
<Route path="/login" element={<Login />} />
<Route path="/verify-email" element={<EmailVerification />} />
<Route path="/reset-password" element={<PasswordReset />} />
<Route path="/auth-callback" element={<AuthCallback />} />

// Protect existing routes with AuthContext check
// Example for admin:
<Route 
  path="/admin/*" 
  element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>} 
/>
```

---

## 🐛 Common Issues & Solutions

### Issue: Email not sending
**Solution:** 
- Use Gmail app password (not regular Gmail password)
- Enable 2FA on Gmail account
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`

### Issue: Google OAuth redirect not working
**Solution:**
- Check `FRONTEND_URL` matches redirect target
- Verify redirect URI in Google Cloud Console
- Check browser console for errors

### Issue: Token expires too quickly
**Solution:**
- Increase `JWT_EXPIRE` in `.env` (e.g., `14d` for 14 days)
- Clear localStorage and try again

### Issue: User stuck on email verification
**Solution:**
- Backend logs show verification token
- Ensure token is copied correctly
- Token expires after 24 hours

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running on correct port (5000)
- Check CORS settings in backend
- Verify API URL in frontend is correct

---

## 📈 Scaling Notes for Production

Before deploying to production:

1. **Security:**
   - Generate strong `JWT_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - Use environment variables for all secrets
   - Enable HTTPS
   - Add rate limiting for auth endpoints

2. **Email:**
   - Consider SendGrid or AWS SES for production emails
   - Use email templates/styling
   - Add email bounce handling

3. **Database:**
   - Set up MongoDB Atlas or managed service
   - Configure backups
   - Add indexes on frequently queried fields

4. **Frontend:**
   - Configure proper API base URL
   - Add error boundaries
   - Set up analytics/monitoring

5. **Backend:**
   - Add request/response logging
   - Set up health checks
   - Configure monitoring/alerts

---

## ✅ Verification Commands

Run these to verify setup:

```bash
# Backend - Check if Passport is loaded
curl http://localhost:5000/health

# Frontend - Check if routes are working
# Navigate to each page and verify no console errors

# Test auth endpoint (should return 401 if no token)
curl -X GET http://localhost:5000/api/auth/me

# Test email is configured
# Check if welcome email is sent after verification
```

---

## 📞 Next Steps

1. Follow setup instructions above
2. Test all authentication flows
3. Fix any issues based on error messages
4. Deploy to staging environment
5. Perform full testing
6. Deploy to production

---

## 🎯 Success Indicators

Your implementation is successful when:

- ✅ Users can register and verify email
- ✅ Verification emails arrive in inbox
- ✅ Google OAuth creates accounts automatically
- ✅ Password reset links work
- ✅ JWT tokens are issued correctly
- ✅ Protected routes require valid token
- ✅ Role-based access control works
- ✅ Email verification is required before login
- ✅ No console errors on frontend
- ✅ No errors in backend logs

---

Last Updated: May 8, 2026
Ready for Testing!
