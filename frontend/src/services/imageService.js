// frontend/src/services/imageService.js

import API from "./api";

// Upload multiple images with progress tracking
export const uploadMultipleImages = async (files, onProgress) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await API.post("/images/upload-multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Upload single image with progress tracking
export const uploadImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await API.post("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Get all images for the logged-in user
export const getUserImages = async () => {
  const response = await API.get("/images/my-images");
  return response.data;
};

// Get a single image by ID
export const getImage = async (imageId) => {
  const response = await API.get(`/images/${imageId}`);
  return response.data;
};

// Generate share link
export const generateShareLink = async (imageId, expirationDate) => {
  const response = await API.post(`/images/${imageId}/share`, {
    expirationDate,
  });
  return response.data;
};

// ⚠️ CRITICAL FIX: Get shared image by token using fetch (bypasses axios interceptors)
export const getSharedImage = async (token) => {
  try {
    const authToken = localStorage.getItem("token");
    console.log("getSharedImage - Token from localStorage:", authToken);

    const headers = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      console.log("getSharedImage - Added Authorization header");
    } else {
      console.log("getSharedImage - No token found");
    }

    const response = await fetch(`${BACKEND_URL}/api/images/shared/${token}`, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();
    console.log("Shared image response (fetch):", data);

    if (!response.ok) {
      // Return the error data so it can be handled like axios
      return data;
    }

    return data;
  } catch (error) {
    console.error("Get shared image error (fetch):", error);
    throw error;
  }
};

// Toggle share link status (activate/deactivate)
export const toggleShareLink = async (linkId) => {
  const response = await API.put(`/images/share/${linkId}/toggle`);
  return response.data;
};

// Revoke share link (permanently disable)
export const revokeShareLink = async (linkId) => {
  const response = await API.delete(`/images/share/${linkId}/revoke`);
  return response.data;
};

// Get all share links for an image
export const getShareLinks = async (imageId) => {
  const response = await API.get(`/images/${imageId}/links`);
  return response.data;
};

// Delete image
export const deleteImage = async (imageId) => {
  const response = await API.delete(`/images/${imageId}`);
  return response.data;
};
