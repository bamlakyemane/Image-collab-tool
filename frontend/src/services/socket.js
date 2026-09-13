// frontend/src/services/socket.js

import { io } from "socket.io-client";
import config from "../config";

let socket = null;
let isInitialized = false;
let globalListeners = {};

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    isInitialized = true;
    return socket;
  }

  if (socket) {
    socket.connect();
    return socket;
  }

  const authToken = token || localStorage.getItem("token");

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
    isInitialized = true;
    // Re-apply any global listeners
    Object.keys(globalListeners).forEach((event) => {
      globalListeners[event].forEach((callback) => {
        socket.on(event, callback);
      });
    });
  });

  socket.on("welcome", (data) => {});

  socket.on("disconnect", (reason) => {
    isInitialized = false;
  });

  socket.on("connect_error", (error) => {
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
    return initializeSocket(token);
  }

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
    return false;
  }

  try {
    socket.emit("join-image", imageId);

    return true;
  } catch (error) {
    return false;
  }
};

export const leaveImageRoom = (imageId) => {
  if (!socket || !socket.connected) {
    return false;
  }

  try {
    socket.emit("leave-image", imageId);

    return true;
  } catch (error) {
    return false;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isInitialized = false;
  }
};

export const isSocketConnected = () => {
  return socket && socket.connected;
};
