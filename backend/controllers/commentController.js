// backend/controllers/commentController.js

const prisma = require("../prisma");
const { notifyThreadParticipants } = require("../services/notificationService");

// Create a new pin with comment
const createPin = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { xCoordinate, yCoordinate, content } = req.body;
    const userId = req.userId;

    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id: parseInt(imageId) },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Create pin
    const pin = await prisma.pin.create({
      data: {
        xCoordinate,
        yCoordinate,
        imageId: parseInt(imageId),
        creatorId: userId,
        comments: {
          create: {
            content,
            authorId: userId,
          },
        },
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
      },
    });

    await notifyThreadParticipants(pin.id, "new_thread", userId, {
      commentContent: content,
      authorName: req.user?.name || "Someone",
    });

    // Update image comment count
    await prisma.image.update({
      where: { id: parseInt(imageId) },
      data: {
        commentCount: {
          increment: 1,
        },
        lastActivity: new Date(),
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "comment",
        imageId: parseInt(imageId),
        userId: userId,
      },
    });

    res.status(201).json({
      success: true,
      pin,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Create pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};

// Add comment to existing pin
const addComment = async (req, res) => {
  try {
    const { pinId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    // Check if pin exists
    const pin = await prisma.pin.findUnique({
      where: { id: parseInt(pinId) },
      include: {
        image: true,
      },
    });

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        pinId: parseInt(pinId),
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    await notifyThreadParticipants(parseInt(pinId), "new_reply", userId, {
      commentContent: content,
      authorName: req.user?.name || "Someone",
    });

    // Update image comment count
    await prisma.image.update({
      where: { id: pin.imageId },
      data: {
        commentCount: {
          increment: 1,
        },
        lastActivity: new Date(),
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: "comment",
        imageId: pin.imageId,
        userId: userId,
      },
    });

    res.status(201).json({
      success: true,
      comment,
      pinId: parseInt(pinId),
      message: "Reply added successfully",
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add reply",
    });
  }
};

// Toggle pin resolved status
const togglePinStatus = async (req, res) => {
  try {
    const { pinId } = req.params;
    const userId = req.userId;

    const pin = await prisma.pin.findUnique({
      where: { id: parseInt(pinId) },
      include: { image: true },
    });

    if (!pin) {
      return res.status(404).json({
        success: false,
        message: "Pin not found",
      });
    }

    // Only the image owner or pin creator can resolve
    if (pin.creatorId !== userId && pin.image.ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to change this pin status",
      });
    }

    const updatedPin = await prisma.pin.update({
      where: { id: parseInt(pinId) },
      data: {
        isResolved: !pin.isResolved,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
      },
    });

    await notifyThreadParticipants(
      parseInt(pinId),
      updatedPin.isResolved ? "thread_resolved" : "thread_reopened",
      userId,
      {
        commentContent: `Status changed to ${updatedPin.isResolved ? "resolved" : "reopened"}`,
        authorName: req.user?.name || "Someone",
      },
    );

    // Create activity log
    await prisma.activity.create({
      data: {
        action: updatedPin.isResolved ? "resolve" : "reopen",
        imageId: pin.imageId,
        userId: userId,
      },
    });

    res.json({
      success: true,
      pin: updatedPin,
      message: `Pin ${updatedPin.isResolved ? "resolved" : "reopened"} successfully`,
    });
  } catch (error) {
    console.error("Toggle pin status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update pin status",
    });
  }
};

// Get all pins for an image
const getPins = async (req, res) => {
  try {
    const { imageId } = req.params;

    const pins = await prisma.pin.findMany({
      where: {
        imageId: parseInt(imageId),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
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
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      pins,
    });
  } catch (error) {
    console.error("Get pins error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

module.exports = {
  createPin,
  addComment,
  togglePinStatus,
  getPins,
};
