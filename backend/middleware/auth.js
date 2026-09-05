// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

// Main auth middleware - extracts user if token exists, but doesn't require it
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided - continue without user
      req.userId = null;
      return next();
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-this",
    );

    // Add userId to request object
    req.userId = decoded.userId;
    console.log("Auth middleware - User authenticated:", req.userId);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    // On error, continue without user
    req.userId = null;
    next();
  }
};

// Middleware that REQUIRES authentication
const requireAuth = (req, res, next) => {
  // First, try to authenticate
  authMiddleware(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed",
      });
    }

    // Check if user is authenticated
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    next();
  });
};

module.exports = authMiddleware;
module.exports.requireAuth = requireAuth;
