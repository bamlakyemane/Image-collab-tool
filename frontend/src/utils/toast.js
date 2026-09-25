// frontend/src/utils/toast.js

import { toast } from "react-toastify";

export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 3500,
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    position: "top-right",
  });
};

export const updateToast = (toastId, type, message) => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
  });
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
