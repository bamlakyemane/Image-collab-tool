// backend/services/notificationService.js

const nodemailer = require("nodemailer");
const transporter = require("../config/email");
const prisma = require("../prisma");

// Helper: get user's email preference
const shouldSendNotification = (user, eventType) => {
  if (!user || !user.notificationPreferences) return false;
  const prefs = user.notificationPreferences;
  // Map event types to preference keys
  const prefMap = {
    new_thread: "newThread",
    new_reply: "newReply",
    thread_resolved: "threadResolved",
    thread_reopened: "threadResolved", // same key
  };
  const key = prefMap[eventType];
  return prefs[key] !== false; // default true if not set
};

// Send email notification to a user
const sendNotification = async (toUser, eventType, data) => {
  try {
    // Check if user wants this notification
    if (!shouldSendNotification(toUser, eventType)) {
      console.log(
        `🔕 Notifications disabled for ${toUser.email} for event ${eventType}`,
      );
      return;
    }

    // Build email content
    const subject = getSubject(eventType, data);
    const html = getEmailHTML(eventType, data, toUser);

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        '"Image Collaboration Tool" <noreply@imagecollab.com>',
      to: toUser.email,
      subject: subject,
      html: html,
    });

    console.log(`📧 Email sent to ${toUser.email} (${info.messageId})`);

    // For Ethereal, log the preview URL
    if (process.env.NODE_ENV !== "production" && nodemailer.getTestMessageUrl) {
      console.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

// Get email subject
const getSubject = (eventType, data) => {
  switch (eventType) {
    case "new_thread":
      return `💬 New comment on "${data.imageName}"`;
    case "new_reply":
      return `↩️ New reply on "${data.imageName}"`;
    case "thread_resolved":
      return `✅ Thread resolved on "${data.imageName}"`;
    case "thread_reopened":
      return `🔄 Thread reopened on "${data.imageName}"`;
    default:
      return `📬 Update from Image Collaboration Tool`;
  }
};

// Get email HTML
const getEmailHTML = (eventType, data, toUser) => {
  const imageName = data.imageName || "an image";
  const threadContent = data.commentContent || "";
  const threadAuthor = data.authorName || "Someone";
  const link =
    data.shareUrl ||
    `${process.env.FRONTEND_URL || "http://localhost:5173"}/library`;

  let actionText = "";
  switch (eventType) {
    case "new_thread":
      actionText = `commented on "${imageName}"`;
      break;
    case "new_reply":
      actionText = `replied to a thread on "${imageName}"`;
      break;
    case "thread_resolved":
      actionText = `resolved a thread on "${imageName}"`;
      break;
    case "thread_reopened":
      actionText = `reopened a thread on "${imageName}"`;
      break;
  }

  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h2 style="color: #333;">📸 Image Collaboration Tool</h2>
            <p style="color: #555; font-size: 16px;">
                <strong>${threadAuthor}</strong> ${actionText}:
            </p>
            <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 12px 0;">
                <p style="margin: 0; color: #333;">${threadContent}</p>
            </div>
            <p style="margin-top: 16px;">
                <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px;">
                    View Image
                </a>
            </p>
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;" />
            <p style="font-size: 12px; color: #999;">
                You're receiving this because you are subscribed to this thread.
                Manage your notification preferences in your account settings.
            </p>
        </div>
    `;
};

// Main function to notify all participants of a thread (including image owner)
const notifyThreadParticipants = async (
  pinId,
  eventType,
  actorId,
  additionalData = {},
) => {
  try {
    // Get the pin with image, comments, and participants
    const pin = await prisma.pin.findUnique({
      where: { id: pinId },
      include: {
        image: {
          select: {
            id: true,
            fileName: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                notificationPreferences: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
                notificationPreferences: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
            notificationPreferences: true,
          },
        },
      },
    });

    if (!pin) return;

    // Collect all participants (unique users who commented or created the pin, plus owner)
    const participantMap = new Map();

    // Add image owner (always included)
    if (pin.image.owner) {
      participantMap.set(pin.image.owner.id, pin.image.owner);
    }

    // Add pin creator if they're not the owner (already added)
    if (pin.creator && pin.creator.id !== pin.image.ownerId) {
      participantMap.set(pin.creator.id, pin.creator);
    }

    // Add all comment authors
    pin.comments.forEach((comment) => {
      if (comment.author) {
        // Don't override if already exists (e.g., owner)
        if (!participantMap.has(comment.author.id)) {
          participantMap.set(comment.author.id, comment.author);
        }
      }
    });

    // Remove the actor (the person who triggered the event) – they don't need a notification for their own action
    participantMap.delete(actorId);

    // Prepare notification data
    const data = {
      imageName: pin.image.fileName,
      commentContent:
        additionalData.commentContent || pin.comments[0]?.content || "",
      authorName: additionalData.authorName || "Someone",
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/shared/${pin.image.id}`, // Could be more specific
    };

    // Send notification to each participant
    for (const [userId, user] of participantMap) {
      await sendNotification(user, eventType, data);
    }

    console.log(
      `📬 Notified ${participantMap.size} participant(s) for pin ${pinId}`,
    );
  } catch (error) {
    console.error("❌ Error notifying participants:", error);
  }
};

module.exports = {
  sendNotification,
  notifyThreadParticipants,
};
