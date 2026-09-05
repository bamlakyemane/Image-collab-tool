// backend/routes/imageRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requireAuth } = authMiddleware;
const {
  upload,
  uploadMultiple,
  uploadSingle,
} = require("../middleware/upload");
const {
  uploadImage,
  uploadMultipleImages,
  getUserImages,
  getImage,
  generateShareLink,
  getSharedImage,
  toggleShareLink,
  revokeShareLink,
  getShareLinks,
  deleteImage,
} = require("../controllers/imageController");

// Public routes (auth optional)
router.get("/test", (req, res) => {
  res.json({ message: "Image routes are working!" });
});

// ⚠️ IMPORTANT: Shared route uses authMiddleware (optional auth)
router.get("/shared/:token", authMiddleware, getSharedImage);

// Protected routes (auth REQUIRED) - use requireAuth
router.post("/upload", requireAuth, uploadSingle, uploadImage);
router.post(
  "/upload-multiple",
  requireAuth,
  uploadMultiple,
  uploadMultipleImages,
);
router.get("/my-images", requireAuth, getUserImages);
router.get("/:imageId", requireAuth, getImage);
router.get("/:imageId/links", requireAuth, getShareLinks);
router.post("/:imageId/share", requireAuth, generateShareLink);
router.put("/share/:linkId/toggle", requireAuth, toggleShareLink);
router.delete("/share/:linkId/revoke", requireAuth, revokeShareLink);
router.delete("/:imageId", requireAuth, deleteImage);

module.exports = router;
