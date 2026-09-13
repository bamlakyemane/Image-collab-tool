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

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
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
    return response;
  },
  (error) => {
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
