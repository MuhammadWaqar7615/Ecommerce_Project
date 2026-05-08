const passport = require('passport');
const { errorResponse } = require('../utils/apiResponse');

// Passport JWT authentication middleware
const protect = passport.authenticate('jwt', { session: false });

// Wrapper to convert Passport middleware to async error handling
const protectAsync = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return errorResponse(res, err.message || 'Authentication error', 401);
    }

    if (!user) {
      return errorResponse(res, info?.message || 'Not authorized', 401);
    }

    req.user = user;
    next();
  })(req, res, next);
};

module.exports = { protect, protectAsync };