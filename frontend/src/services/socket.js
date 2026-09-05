// frontend/src/services/socket.js

import { io } from "socket.io-client";
import config from "../config";

let socket = null;
let isInitialized = false;
let globalListeners = {};

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    console.log("✅ Socket already connected");
    isInitialized = true;
    return socket;
  }

  if (socket) {
    console.log("🔄 Reconnecting existing socket...");
    socket.connect();
    return socket;
  }

  const authToken = token || localStorage.getItem("token");
  console.log("🆕 Creating new socket connection...");
  console.log("🔑 Token present:", !!authToken);

  socket = io("https://image-collab-tool-api.onrender.com", {
    auth: {
      token: authToken,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully! ID:", socket.id);
    isInitialized = true;
    // Re-apply any global listeners
    Object.keys(globalListeners).forEach((event) => {
      globalListeners[event].forEach((callback) => {
        socket.on(event, callback);
      });
    });
  });

  socket.on("welcome", (data) => {
    console.log("👋 Welcome message from server:", data);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
    isInitialized = false;
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
    isInitialized = false;
  });

  return socket;
};

export const getSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem("token");
  if (token) {
    console.log("📡 Initializing socket with token from localStorage");
    return initializeSocket(token);
  }

  console.warn("⚠️ No socket available and no token found");
  return null;
};

// ✅ NEW: Register a listener that persists across reconnections
export const registerListener = (event, callback) => {
  if (!globalListeners[event]) {
    globalListeners[event] = [];
  }
  globalListeners[event].push(callback);

  if (socket) {
    socket.on(event, callback);
  }
};

// ✅ NEW: Remove a listener
export const removeListener = (event, callback) => {
  if (globalListeners[event]) {
    globalListeners[event] = globalListeners[event].filter(
      (cb) => cb !== callback,
    );
  }
  if (socket) {
    socket.off(event, callback);
  }
};

export const joinImageRoom = (imageId) => {
  if (!socket || !socket.connected) {
    console.warn("⚠️ Cannot join room - socket not connected");
    return false;
  }

  try {
    socket.emit("join-image", imageId);
    console.log(`✅ Joined room: image-${imageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to join room:", error);
    return false;
  }
};

export const leaveImageRoom = (imageId) => {
  if (!socket || !socket.connected) {
    return false;
  }

  try {
    socket.emit("leave-image", imageId);
    console.log(`✅ Left room: image-${imageId}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to leave room:", error);
    return false;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitialized = false;
    console.log("📡 Socket disconnected manually");
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};
