const { errorResponse } = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('User role:', req.user.role); // Debugging line
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, `Access denied. ${req.user.role} not authorized`, 403);
    }
    next();
  };
};

module.exports = { authorize };