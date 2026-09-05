// backend/controllers/adminController.js

const prisma = require("../prisma");

// Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalImages,
      totalComments,
      totalPins,
      pendingReports,
      totalReports,
      bannedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isBanned: false } }),
      prisma.image.count(),
      prisma.comment.count(),
      prisma.pin.count(),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.report.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalImages,
        totalComments,
        totalPins,
        pendingReports,
        totalReports,
        bannedUsers,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
    });
  }
};

// Get all users (with pagination)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          createdAt: true,
          _count: {
            select: {
              images: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.userId;

    console.log("=== updateUserRole ===");
    console.log("adminId:", adminId);
    console.log("targetUserId:", userId);
    console.log("requested role:", role);

    const validRoles = ["user", "moderator", "admin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Get admin info
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { role: true },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    console.log("Admin role in DB:", admin.role);

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { role: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Only super_admin can promote to admin
    if (role === "admin" && !admin.role.includes("super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Only super admins can promote users to admin",
      });
    }

    // Prevent demoting yourself
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // ✅ FIX: Try to log activity, but don't fail if it errors
    try {
      // Find a valid imageId for activity log
      const anyImage = await prisma.image.findFirst({
        select: { id: true },
      });

      if (anyImage) {
        await prisma.activity.create({
          data: {
            action: `role_changed_to_${role}`,
            userId: adminId,
            imageId: anyImage.id,
          },
        });
      } else {
        console.log("⚠️ No image found for activity log, skipping");
      }
    } catch (activityError) {
      // Don't fail the main request if activity logging fails
      console.warn("⚠️ Activity logging failed:", activityError.message);
    }

    console.log("✅ User role updated successfully");

    res.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("❌ Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// Ban/unban user
const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent banning super_admin
    if (targetUser.role.includes("super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Cannot ban a super admin",
      });
    }

    // Prevent banning yourself
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot ban yourself",
      });
    }

    const isBanned = !targetUser.isBanned;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        isBanned,
        bannedAt: isBanned ? new Date() : null,
        bannedReason: isBanned ? reason || "No reason provided" : null,
        bannedBy: isBanned ? adminId : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        bannedReason: true,
      },
    });

    // ✅ FIX: Safe activity logging
    try {
      const anyImage = await prisma.image.findFirst({
        select: { id: true },
      });

      if (anyImage) {
        await prisma.activity.create({
          data: {
            action: isBanned ? "user_banned" : "user_unbanned",
            userId: adminId,
            imageId: anyImage.id,
          },
        });
      }
    } catch (activityError) {
      console.warn("⚠️ Activity logging failed:", activityError.message);
    }

    res.json({
      success: true,
      user: updatedUser,
      message: isBanned
        ? "User banned successfully"
        : "User unbanned successfully",
    });
  } catch (error) {
    console.error("Toggle user ban error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status !== "all") {
      where.status = status;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          resolver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.report.count({ where }),
    ]);

    // Fetch the actual target data (image, comment, etc.)
    const enrichedReports = await Promise.all(
      reports.map(async (report) => {
        let target = null;
        try {
          switch (report.targetType) {
            case "image":
              target = await prisma.image.findUnique({
                where: { id: report.targetId },
                include: { owner: { select: { name: true, email: true } } },
              });
              break;
            case "comment":
              target = await prisma.comment.findUnique({
                where: { id: report.targetId },
                include: { author: { select: { name: true, email: true } } },
              });
              break;
            case "pin":
              target = await prisma.pin.findUnique({
                where: { id: report.targetId },
                include: { creator: { select: { name: true, email: true } } },
              });
              break;
            case "user":
              target = await prisma.user.findUnique({
                where: { id: report.targetId },
                select: { id: true, name: true, email: true },
              });
              break;
          }
        } catch (e) {
          console.error("Error fetching target:", e);
        }
        return { ...report, target };
      }),
    );

    res.json({
      success: true,
      reports: enrichedReports,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};

// Create a report (user reports content)
const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const userId = req.userId;

    // Validate targetType
    const validTypes = ["image", "comment", "pin", "user"];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target type",
      });
    }

    // Check if user already reported this
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: userId,
        targetType,
        targetId: parseInt(targetId),
        status: "pending",
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this content",
      });
    }

    const report = await prisma.report.create({
      data: {
        targetType,
        targetId: parseInt(targetId),
        reason,
        details,
        reporterId: userId,
        status: "pending",
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      report,
      message: "Report submitted successfully",
    });
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create report",
    });
  }
};

// Resolve a report (admin/moderator action)
const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, adminNote } = req.body; // action: 'delete_content', 'dismiss', 'warn_user'
    const userId = req.userId;

    const report = await prisma.report.findUnique({
      where: { id: parseInt(reportId) },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Report has already been resolved",
      });
    }

    // Handle different actions
    if (action === "delete_content") {
      // Delete the reported content
      switch (report.targetType) {
        case "image":
          await prisma.image.delete({ where: { id: report.targetId } });
          break;
        case "comment":
          await prisma.comment.delete({ where: { id: report.targetId } });
          break;
        case "pin":
          await prisma.pin.delete({ where: { id: report.targetId } });
          break;
        case "user":
          await prisma.user.update({
            where: { id: report.targetId },
            data: {
              isBanned: true,
              bannedReason: "Reported content violation",
            },
          });
          break;
      }
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id: parseInt(reportId) },
      data: {
        status: action === "dismiss" ? "rejected" : "resolved",
        resolvedAt: new Date(),
        resolvedBy: userId,
        adminNote: adminNote || null,
      },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        resolver: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: `report_${action}`,
        userId: userId,
        imageId: 1,
      },
    });

    res.json({
      success: true,
      report: updatedReport,
      message: `Report ${action === "dismiss" ? "dismissed" : "resolved"} successfully`,
    });
  } catch (error) {
    console.error("Resolve report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve report",
    });
  }
};

// Delete any image (admin/mod)
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    console.log(`🛠️ Admin deleting image ${imageId} by user ${userId}`);

    // Find the image first
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    console.log(`📸 Image found: ${image.fileName}, fileUrl: ${image.fileUrl}`);

    // ✅ STEP 1: Get a valid imageId for activity logging
    const anyImage = await prisma.image.findFirst({
      select: { id: true },
    });

    // ✅ STEP 2: Log activity BEFORE deleting (with valid imageId)
    try {
      if (anyImage) {
        await prisma.activity.create({
          data: {
            action: "admin_deleted_image",
            userId: userId,
            imageId: anyImage.id, // Use any valid image ID
          },
        });
        console.log("✅ Activity logged");
      } else {
        console.log("⚠️ No image found for activity log, skipping");
      }
    } catch (activityError) {
      console.warn("⚠️ Activity logging failed:", activityError.message);
      // Continue with deletion even if logging fails
    }

    // ✅ STEP 3: Delete the image file from disk
    const fs = require("fs");
    const path = require("path");
    const uploadsDir = path.join(__dirname, "../uploads");
    const fileName = path.basename(image.fileUrl);
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("✅ File deleted from disk");
    } else {
      console.log("⚠️ File not found on disk, skipping deletion");
    }

    // ✅ STEP 4: Delete the image record from database
    await prisma.image.delete({
      where: { id: parseInt(imageId) },
    });
    console.log("✅ Image record deleted from database");

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("❌ Admin delete image error DETAILS:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    console.log(`🛠️ Admin deleting comment ${commentId} by user ${userId}`);

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });
    console.log("✅ Comment deleted from database");

    await prisma.activity.create({
      data: {
        action: "admin_deleted_comment",
        userId: userId,
        imageId: 1, // placeholder
      },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Admin delete comment error DETAILS:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
      error: error.message, // TEMPORARY
    });
  }
};

const getAllImages = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", ownerId = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.fileName = { contains: search, mode: "insensitive" };
    }
    if (ownerId) {
      where.ownerId = parseInt(ownerId);
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        select: {
          id: true,
          fileName: true,
          fileUrl: true, // ✅ Explicitly include
          commentCount: true, // ✅ Explicitly include
          uploadDate: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              pins: true,
              shareLinks: true,
            },
          },
        },
        orderBy: { uploadDate: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.image.count({ where }),
    ]);

    res.json({
      success: true,
      images,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get all images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
};
const bulkDeleteImages = async (req, res) => {
  try {
    const { imageIds } = req.body;
    const adminId = req.userId;

    if (!imageIds || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image IDs provided",
      });
    }

    const ids = imageIds.map((id) => parseInt(id));

    // Get images to delete files
    const images = await prisma.image.findMany({
      where: { id: { in: ids } },
    });

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found",
      });
    }

    // ✅ Find a valid image ID for activity logging
    const anyImage = await prisma.image.findFirst({
      select: { id: true },
    });

    // ✅ Log activity BEFORE deleting
    try {
      if (anyImage) {
        await prisma.activity.create({
          data: {
            action: `admin_bulk_deleted_${images.length}_images`,
            userId: adminId,
            imageId: anyImage.id,
          },
        });
        console.log("✅ Activity logged");
      }
    } catch (activityError) {
      console.warn("⚠️ Activity logging failed:", activityError.message);
    }

    // Delete files from disk
    const fs = require("fs");
    const path = require("path");
    images.forEach((image) => {
      const filePath = path.join(
        __dirname,
        "../uploads",
        path.basename(image.fileUrl),
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete from database
    await prisma.image.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({
      success: true,
      message: `${images.length} images deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete images",
      error: error.message,
    });
  }
};
// ✅ Add this function - Get all activity logs
const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action = "", userId = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (action) {
      where.action = { contains: action, mode: "insensitive" };
    }
    if (userId) {
      where.userId = parseInt(userId);
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          image: {
            select: {
              id: true,
              fileName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      success: true,
      activities,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get activity logs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};

module.exports = {
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
};
