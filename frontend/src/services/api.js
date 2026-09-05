// frontend/src/services/api.js

import axios from "axios";
import config from "../config";

const API = axios.create({
  baseURL: "https://image-collab-tool-api.onrender.com/api",
});

// Add a request interceptor to include token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("API Interceptor - Token:", token);
    console.log("API Interceptor - Config URL:", config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("API Interceptor - Added Authorization header");
    } else {
      console.log("API Interceptor - No token found");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
API.interceptors.response.use(
  (response) => {
    console.log("API Response - Status:", response.status);
    console.log("API Response - URL:", response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);

    // Only redirect to login for 401 errors that are NOT from the shared image endpoint
    const isSharedRoute = error.config?.url?.includes("/shared/");

    if (error.response?.status === 401 && !isSharedRoute) {
      // Token expired or invalid - only redirect for non-shared routes
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default API;
