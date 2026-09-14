// frontend/src/services/api.js

import axios from "axios";
import { API_URL } from "../config"; // ✅ named import

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
    if (error.response?.status === 401) {
      const isSharedRoute = error.config?.url?.includes("/shared/");
      if (!isSharedRoute) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default API;
