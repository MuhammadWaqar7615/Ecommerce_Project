const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Temporarily disabled
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// ==================== LOCAL STRATEGY ====================
// For manual registration and login with username/email and password
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email', // Use email instead of username for login
      passwordField: 'password',
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        // Find user by email or username
        const user = await User.findOne({
          $or: [{ email: email.toLowerCase() }, { username: email }],
          provider: 'local',
        });

        if (!user) {
          return done(null, false, {
            message: 'User not found with this email/username',
          });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
          return done(null, false, {
            message: 'Please verify your email before logging in',
          });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        // Check if account is active
        if (!user.isActive) {
          return done(null, false, {
            message: 'Your account has been deactivated',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==================== GOOGLE STRATEGY ====================
// For Google OAuth authentication
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL,
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({
          providerId: profile.id,
          provider: 'google',
        });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with this email (manual registration)
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // Link Google to existing account
          existingUser.providerId = profile.id;
          existingUser.provider = 'google';
          existingUser.isEmailVerified = true;
          if (!existingUser.fullName) {
            existingUser.fullName = profile.displayName;
          }
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user from Google profile
        const newUser = new User({
          email: profile.emails[0].value,
          fullName: profile.displayName,
          provider: 'google',
          providerId: profile.id,
          isEmailVerified: true,
          username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
          phone: '',
          password: null,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==================== JWT STRATEGY ====================
// For verifying JWT tokens in API requests
passport.use(
  'jwt',
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        if (!user.isActive) {
          return done(null, false, {
            message: 'User account is deactivated',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// ==================== SERIALIZATION ====================
// For session-based authentication (if needed in future)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
