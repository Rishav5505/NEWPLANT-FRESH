/**
 * API Error Handler Utility
 * Centralized error handling for API calls
 */

export const API_ERRORS = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT: "Request timeout. Please try again.",
  NOT_FOUND: "Resource not found.",
  UNAUTHORIZED: "Please log in to continue.",
  FORBIDDEN: "You don't have permission to access this.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Invalid input. Please check your data.",
};

export const handleApiError = (error) => {
  if (!error) return API_ERRORS.SERVER_ERROR;
  
  if (error.message === "Network Error" || !navigator.onLine) {
    return API_ERRORS.NETWORK_ERROR;
  }
  
  if (error.code === "ECONNABORTED") {
    return API_ERRORS.TIMEOUT;
  }
  
  if (error.response) {
    const status = error.response.status;
    if (status === 404) return API_ERRORS.NOT_FOUND;
    if (status === 401) return API_ERRORS.UNAUTHORIZED;
    if (status === 403) return API_ERRORS.FORBIDDEN;
    if (status === 400) return API_ERRORS.VALIDATION_ERROR;
    if (status >= 500) return API_ERRORS.SERVER_ERROR;
    return error.response.data?.message || API_ERRORS.SERVER_ERROR;
  }
  
  return error.message || API_ERRORS.SERVER_ERROR;
};

export const showErrorNotification = (message, duration = 5000) => {
  const notification = document.createElement("div");
  notification.className = "fixed top-20 right-4 bg-red-900/80 text-white px-6 py-4 rounded-lg border border-red-600 shadow-lg z-50 animate-pulse";
  notification.textContent = `❌ ${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
};

export const showSuccessNotification = (message, duration = 3000) => {
  const notification = document.createElement("div");
  notification.className = "fixed top-20 right-4 bg-green-900/80 text-white px-6 py-4 rounded-lg border border-green-600 shadow-lg z-50";
  notification.textContent = `✅ ${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, duration);
};
