// frontend/src/services/commentService.js

import API from "./api";

// Create a new pin with comment
export const createPin = async (imageId, xCoordinate, yCoordinate, content) => {
  const response = await API.post(`/comments/image/${imageId}/pin`, {
    xCoordinate,
    yCoordinate,
    content,
  });
  return response.data;
};

// Add comment to existing pin
export const addComment = async (pinId, content) => {
  const response = await API.post(`/comments/pin/${pinId}/comment`, {
    content,
  });
  return response.data;
};

// Toggle pin resolved status
export const togglePinStatus = async (pinId) => {
  const response = await API.put(`/comments/pin/${pinId}/toggle`);
  return response.data;
};

// Get all pins for an image
export const getPins = async (imageId) => {
  const response = await API.get(`/comments/image/${imageId}`);
  return response.data;
};
