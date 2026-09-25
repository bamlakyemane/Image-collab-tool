// frontend/src/services/api.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSharedRoute = error.config?.url?.includes("/shared/");
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const isSignupRequest = error.config?.url?.includes("/auth/signup");

    if (
      error.response?.status === 401 &&
      !isSharedRoute &&
      !isLoginRequest &&
      !isSignupRequest
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default API;
