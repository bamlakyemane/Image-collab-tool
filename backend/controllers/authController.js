// backend/controllers/authController.js

const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "your-secret-key-change-this",
    { expiresIn: "7d" },
  );
};

// Signup controller
const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const newUser = await User.create({ name, email, password });
    const userJSON = User.toJSON(newUser);
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      token,
      user: userJSON,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error DETAILS:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

// Login controller
const login = async (req, res) => {
  try {
    console.log("=== Login Attempt ===");
    console.log("Email:", req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await User.comparePassword(user, password);
    console.log("Password valid:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const userJSON = User.toJSON(user);
    const token = generateToken(user.id);
    console.log("Token generated for user:", user.id);

    res.json({
      success: true,
      token,
      user: userJSON,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error DETAILS:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Get current user profile (protected route)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log("Profile fetched for user:", user.id, "role:", user.role);
    res.json({
      success: true,
      user: {
        ...user,
        role: user.role || "user", // Include role
      },
    });
  } catch (error) {
    console.error("Profile error DETAILS:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
};
