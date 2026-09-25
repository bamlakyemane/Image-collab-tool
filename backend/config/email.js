// backend/config/email.js

const nodemailer = require("nodemailer");

let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error("❌ Email service error:", error.message);
    } else {
      console.log("✅ Email service ready");
    }
  });
} else {
  console.warn("⚠️ Email service not configured");
}

module.exports = transporter;
