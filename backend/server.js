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

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files with caching
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d", // Cache for 1 day
    etag: true,
    lastModified: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running!" });
});

// ✅ Dynamic CORS for development and production
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS || "http://localhost:5173"
).split(",");

console.log("✅ CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS blocked:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with more permissive options
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // Allow both transports
  allowEIO3: true, // Allow Engine.IO v3 clients
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);
  console.log("📡 Total connections:", io.engine.clientsCount);

  // Send a welcome message to confirm connection
  socket.emit("welcome", { message: "Connected to server!" });

  // Join a room for a specific image
  socket.on("join-image", (imageId) => {
    socket.join(`image-${imageId}`);
    console.log(`📌 Socket ${socket.id} joined image-${imageId}`);
    console.log(
      `📌 Room image-${imageId} has ${io.sockets.adapter.rooms.get(`image-${imageId}`)?.size || 0} clients`,
    );
  });

  // Leave a room
  socket.on("leave-image", (imageId) => {
    socket.leave(`image-${imageId}`);
    console.log(`📌 Socket ${socket.id} left image-${imageId}`);
  });

  // Handle new comment
  socket.on("new-comment", (data) => {
    console.log(`💬 New comment event received for image-${data.imageId}`);
    console.log("💬 Data:", data);

    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(`image-${data.imageId}`).emit("comment-added", data);
    console.log(`💬 Comment broadcast to image-${data.imageId}`);
  });

  // Handle new pin
  socket.on("new-pin", (data) => {
    console.log(`📌 New pin event received for image-${data.imageId}`);
    socket.to(`image-${data.imageId}`).emit("pin-added", data);
    console.log(`📌 Pin broadcast to image-${data.imageId}`);
  });

  // Handle pin resolution status change
  socket.on("pin-resolved", (data) => {
    console.log(
      `🔄 Pin status change event received for image-${data.imageId}`,
    );
    socket.to(`image-${data.imageId}`).emit("pin-status-changed", data);
    console.log(`🔄 Status change broadcast to image-${data.imageId}`);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    console.log("📡 Total connections:", io.engine.clientsCount);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

// Make io accessible to routes
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 Auth routes available at http://localhost:${PORT}/api/auth`);
  console.log(
    `🔗 Image routes available at http://localhost:${PORT}/api/images`,
  );
  console.log(`🔗 Socket.IO server running on port ${PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error("❌ Server error:", error);
});
