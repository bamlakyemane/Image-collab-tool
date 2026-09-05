// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { isAdmin, isSuperAdmin } = require("../middleware/admin");
const {
  getStats,
  getUsers,
  updateUserRole,
  toggleUserBan,
  getReports,
  createReport,
  resolveReport,
  deleteImage,
  deleteComment,
  getAllImages,
  bulkDeleteImages,
  getActivityLogs,
} = require("../controllers/adminController");

// Public report route (any authenticated user can report)
router.post("/reports", authMiddleware, createReport);

// Admin-only routes
router.get("/stats", authMiddleware, isAdmin, getStats);
router.get("/users", authMiddleware, isAdmin, getUsers);
router.put("/users/:userId/role", authMiddleware, isAdmin, updateUserRole);
router.put("/users/:userId/ban", authMiddleware, isAdmin, toggleUserBan);
router.get("/reports", authMiddleware, isAdmin, getReports);
router.put(
  "/reports/:reportId/resolve",
  authMiddleware,
  isAdmin,
  resolveReport,
);
router.delete("/images/bulk", authMiddleware, isAdmin, bulkDeleteImages);
router.delete("/images/:imageId", authMiddleware, isAdmin, deleteImage);
router.delete("/comments/:commentId", authMiddleware, isAdmin, deleteComment);
router.get("/images", authMiddleware, isAdmin, getAllImages);
router.get("/activities", authMiddleware, isAdmin, getActivityLogs);

module.exports = router;
