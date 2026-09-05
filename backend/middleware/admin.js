// backend/middleware/admin.js

const prisma = require("../prisma");

// Check if user is authenticated and has admin role
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isBanned: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    // ✅ Use includes to match both 'admin' and 'super_admin'
    if (!user.role.includes("admin")) {
      console.log(`Admin access denied for user ${userId}, role: ${user.role}`);
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    console.log(`Admin access granted for user ${userId}, role: ${user.role}`);
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Check if user is super admin
const isSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.role.includes("super_admin")) {
      return res.status(403).json({
        success: false,
        message: "Super admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  isAdmin,
  isSuperAdmin,
};
