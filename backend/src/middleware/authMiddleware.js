const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

// Verify JWT token
const authenticate = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', null, 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 'No token provided', null, 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired', null, 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token', null, 401);
    }
    return sendError(res, 'Authentication failed', null, 401);
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', null, 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. Insufficient permissions', null, 403);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};

