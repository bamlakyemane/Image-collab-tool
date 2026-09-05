// backend/routes/commentRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const {
  createPin,
  addComment,
  togglePinStatus,
  getPins,
} = require("../controllers/commentController");

// Public routes (no auth required - for shared view)
router.get("/image/:imageId", getPins);

// Protected routes (auth required)
router.post("/image/:imageId/pin", authMiddleware, createPin);
router.post("/pin/:pinId/comment", authMiddleware, addComment);
router.put("/pin/:pinId/toggle", authMiddleware, togglePinStatus);

module.exports = router;
