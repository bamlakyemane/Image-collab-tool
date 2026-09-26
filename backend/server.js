// backend/server.js

const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ✅ ALLOWED ORIGINS - Define this FIRST
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://image-collab-tool.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      // ✅ Allow all Vercel preview URLs
      if (
        origin.endsWith(".vercel.app") &&
        origin.includes("image-collab-tool")
      ) {
        return callback(null, true);
      }

      // ✅ Allow exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.emit("welcome", { message: "Connected to server!" });

  socket.on("join-image", (imageId) => {
    socket.join(`image-${imageId}`);

    console.log(
      `📌 Room image-${imageId} has ${io.sockets.adapter.rooms.get(`image-${imageId}`)?.size || 0} clients`,
    );
  });

  socket.on("leave-image", (imageId) => {
    socket.leave(`image-${imageId}`);
  });

  socket.on("new-comment", (data) => {
    socket.to(`image-${data.imageId}`).emit("comment-added", data);
  });

  socket.on("new-pin", (data) => {
    socket.to(`image-${data.imageId}`).emit("pin-added", data);
  });

  socket.on("pin-resolved", (data) => {
    console.log(
      `🔄 Pin status change event received for image-${data.imageId}`,
    );
    socket.to(`image-${data.imageId}`).emit("pin-status-changed", data);
  });

  socket.on("disconnect", (reason) => {});

  socket.on("error", (error) => {});
});

// Make io accessible to routes
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(
    `🔗 Image routes available at http://localhost:${PORT}/api/images`,
  );
});

server.on("error", (error) => {});
