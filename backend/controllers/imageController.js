// backend/controllers/imageController.js

const prisma = require("../prisma");
const { v4: uuidv4 } = require("uuid");

// Upload a new image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file uploaded",
      });
    }

    const userId = req.userId;
    const { originalname, filename, path: filePath } = req.file;

    // For now, we'll store the file path as URL
    // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
    const fileUrl = `/uploads/${filename}`;

    // Create image record in database
    const image = await prisma.image.create({
      data: {
        fileName: originalname,
        fileUrl: fileUrl,
        ownerId: userId,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "upload",
        imageId: image.id,
        userId: userId,
      },
    });

    res.status(201).json({
      success: true,
      image,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    });
  }
};
// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files uploaded",
      });
    }

    const userId = req.userId;
    const uploadedImages = [];

    // Process each file
    for (const file of req.files) {
      const { originalname, filename } = file;
      const fileUrl = `/uploads/${filename}`;

      // Create image record in database
      const image = await prisma.image.create({
        data: {
          fileName: originalname,
          fileUrl: fileUrl,
          ownerId: userId,
        },
      });

      // Create activity log
      await prisma.activity.create({
        data: {
          action: "upload",
          imageId: image.id,
          userId: userId,
        },
      });

      uploadedImages.push(image);
    }

    res.status(201).json({
      success: true,
      images: uploadedImages,
      count: uploadedImages.length,
      message: `${uploadedImages.length} images uploaded successfully`,
    });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
    });
  }
};
// Get all images for a user
const getUserImages = async (req, res) => {
  try {
    const userId = req.userId;

    const images = await prisma.image.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        shareLinks: true,
        activities: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get most recent activity
          select: {
            action: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            pins: true,
          },
        },
      },
      orderBy: {
        lastActivity: "desc",
      },
    });

    // Format the response
    const formattedImages = images.map((image) => ({
      ...image,
      lastActivity: image.lastActivity,
      lastActivityDetails: image.activities[0] || null,
    }));

    res.json({
      success: true,
      images: formattedImages,
    });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
    });
  }
};
// Get a single image by ID
const getImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    const image = await prisma.image.findFirst({
      where: {
        id: parseInt(imageId),
        ownerId: userId,
      },
      include: {
        shareLinks: true,
        pins: {
          include: {
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      image,
    });
  } catch (error) {
    console.error("Get image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch image",
    });
  }
};

// Generate share link for an image
const generateShareLink = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { expirationDate } = req.body;
    const userId = req.userId;

    // Check if image exists and belongs to user
    const image = await prisma.image.findFirst({
      where: {
        id: parseInt(imageId),
        ownerId: userId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found or you do not have permission",
      });
    }

    // Generate unique token
    const token = uuidv4();

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        token: token,
        imageId: parseInt(imageId),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        requiresLogin: true,
        isActive: true,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "share",
        imageId: parseInt(imageId),
        userId: userId,
      },
    });

    res.status(201).json({
      success: true,
      shareLink,
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shared/${token}`,
      message: "Share link generated successfully",
    });
  } catch (error) {
    console.error("Generate share link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate share link",
    });
  }
};

// Get shared image by token (public access)
// backend/controllers/imageController.js

// Get shared image by token (public access)
const getSharedImage = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.userId; // Get from auth middleware if available

    console.log("=== getSharedImage ===");
    console.log("Looking for token:", token);
    console.log("User ID:", userId);

    // First, find the share link
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        token: token,
        isActive: true,
        OR: [{ expirationDate: null }, { expirationDate: { gt: new Date() } }],
      },
    });

    console.log("Found shareLink:", shareLink ? "Yes" : "No");

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        message: "Share link not found or expired",
      });
    }

    // Check if login is required
    if (shareLink.requiresLogin && !userId) {
      console.log("Login required - user not authenticated");
      return res.status(401).json({
        success: false,
        message: "Login required to view this image",
        requiresLogin: true,
      });
    }

    console.log("User is authenticated, fetching image...");

    // Get the image with all data
    const image = await prisma.image.findUnique({
      where: {
        id: shareLink.imageId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        pins: {
          include: {
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    console.log("Found image:", image ? "Yes" : "No");

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      image,
      shareLink,
    });
  } catch (error) {
    console.error("Get shared image error DETAILS:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shared image",
    });
  }
};
// Revoke share link (set isActive to false)
const revokeShareLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.userId;

    // Check if link belongs to user's image
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id: parseInt(linkId),
        image: {
          ownerId: userId,
        },
      },
      include: {
        image: true,
      },
    });

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        message: "Share link not found or you do not have permission",
      });
    }

    // Revoke the link
    const updated = await prisma.shareLink.update({
      where: {
        id: parseInt(linkId),
      },
      data: {
        isActive: false,
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "revoke",
        imageId: shareLink.imageId,
        userId: userId,
      },
    });

    res.json({
      success: true,
      shareLink: updated,
      message: "Share link revoked successfully",
    });
  } catch (error) {
    console.error("Revoke share link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to revoke share link",
    });
  }
};

// Get all share links for an image
const getShareLinks = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    // Check if image belongs to user
    const image = await prisma.image.findFirst({
      where: {
        id: parseInt(imageId),
        ownerId: userId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found or you do not have permission",
      });
    }

    const shareLinks = await prisma.shareLink.findMany({
      where: {
        imageId: parseInt(imageId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      shareLinks,
    });
  } catch (error) {
    console.error("Get share links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch share links",
    });
  }
};

// Toggle share link status (active/inactive)
const toggleShareLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.userId;

    // Check if link belongs to user's image
    const shareLink = await prisma.shareLink.findFirst({
      where: {
        id: parseInt(linkId),
        image: {
          ownerId: userId,
        },
      },
    });

    if (!shareLink) {
      return res.status(404).json({
        success: false,
        message: "Share link not found or you do not have permission",
      });
    }

    // Toggle status
    const updated = await prisma.shareLink.update({
      where: {
        id: parseInt(linkId),
      },
      data: {
        isActive: !shareLink.isActive,
      },
    });

    res.json({
      success: true,
      shareLink: updated,
      message: `Share link ${updated.isActive ? "activated" : "deactivated"}`,
    });
  } catch (error) {
    console.error("Toggle share link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle share link",
    });
  }
};

// Delete an image
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const userId = req.userId;

    // Check if image exists and belongs to user
    const image = await prisma.image.findFirst({
      where: {
        id: parseInt(imageId),
        ownerId: userId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found or you do not have permission",
      });
    }

    // Delete image (cascade will delete related records)
    await prisma.image.delete({
      where: {
        id: parseInt(imageId),
      },
    });

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
    });
  }
};

module.exports = {
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
};
