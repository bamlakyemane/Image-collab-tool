// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { signup, login, getProfile } = require("../controllers/authController");
const {
  validateSignup,
  validateLogin,
} = require("../validators/authValidator");
const authMiddleware = require("../middleware/auth");

// Public routes
router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

// Protected routes
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
