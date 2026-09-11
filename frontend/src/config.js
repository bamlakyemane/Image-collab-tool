// frontend/src/config.js

// Backend base URL (without /api)
export const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

// API base URL
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Socket URL
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
