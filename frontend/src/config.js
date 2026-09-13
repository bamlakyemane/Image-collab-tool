// frontend/src/config.js

export const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:5000";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// ✅ Add default export to support both import styles
const config = {
  BACKEND_URL,
  API_URL,
  SOCKET_URL,
};

export default config;
