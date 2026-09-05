// backend/models/User.js

const bcrypt = require("bcryptjs");
const prisma = require("../prisma");

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, password } = userData;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        notificationPreferences: {
          newThread: true,
          newReply: true,
          threadResolved: true,
        },
      },
    });

    return user;
  }

  // Find user by email
  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // Find user by ID
  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        notificationPreferences: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        isBanned: true,
      },
    });
  }

  // Compare password for login
  static async comparePassword(user, candidatePassword) {
    if (!user || !user.password) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  }
  // Get user data without sensitive info
  static toJSON(user) {
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      notificationPreferences: user.notificationPreferences || {
        newThread: true,
        newReply: true,
        threadResolved: true,
      },
      createdAt: user.createdAt,
      role: user.role || "user",
      isBanned: user.isBanned || false,
    };
  }
}

module.exports = User;
