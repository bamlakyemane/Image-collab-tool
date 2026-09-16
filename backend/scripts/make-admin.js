// backend/scripts/make-admin.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2]; // Get email from command line
  const role = process.argv[3] || "admin"; // Get role (default: admin)

  if (!email) {
    console.error("❌ Please provide an email address");
    console.log("Usage: node scripts/make-admin.js <email> [role]");
    console.log("Roles: user, moderator, admin, super_admin");
    process.exit(1);
  }

  const validRoles = ["user", "moderator", "admin", "super_admin"];
  if (!validRoles.includes(role)) {
    console.error(`❌ Invalid role. Use one of: ${validRoles.join(", ")}`);
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: role },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log(
      `✅ User "${user.name}" (${user.email}) is now a ${user.role}!`,
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
