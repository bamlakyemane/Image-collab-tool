// frontend/src/services/socket.js

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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

  socket = io(SOCKET_URL, {
    auth: { token: authToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on("connect", () => {
    isInitialized = true;
    Object.keys(globalListeners).forEach((event) => {
      globalListeners[event].forEach((callback) => {
        socket.on(event, callback);
      });
    });
  });

  socket.on("disconnect", () => {
    isInitialized = false;
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
    isInitialized = false;
  });

  return socket;
};

export const getSocket = () => {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem("token");
  if (token) return initializeSocket(token);
  return null;
};

export const registerListener = (event, callback) => {
  if (!globalListeners[event]) {
    globalListeners[event] = [];
  }
  globalListeners[event].push(callback);
  if (socket) socket.on(event, callback);
};

export const removeListener = (event, callback) => {
  if (globalListeners[event]) {
    globalListeners[event] = globalListeners[event].filter(
      (cb) => cb !== callback,
    );
  }
  if (socket) socket.off(event, callback);
};

export const joinImageRoom = (imageId) => {
  if (!socket || !socket.connected) return false;
  socket.emit("join-image", imageId);
  return true;
};

export const leaveImageRoom = (imageId) => {
  if (!socket || !socket.connected) return false;
  socket.emit("leave-image", imageId);
  return true;
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
