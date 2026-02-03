import axios from 'axios';
import { toast } from 'react-toastify';

import { API_BASE_URL } from '@/config/environment';

// Function to handle 401 errors - will be set by the app
let handleUnauthorized = () => {
  // Default behavior - just log, let the app handle the redirect
  console.log('Unauthorized access detected');
};

// Function to set the unauthorized handler
export const setUnauthorizedHandler = (handler) => {
  handleUnauthorized = handler;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Fetch token from localStorage
    const token = localStorage.getItem('jwt'); // Use the correct key for JWT token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }

    // Add current locale header if available
    const locale = localStorage.getItem('preferred-locale');
    if (locale) {
      config.headers['X-Locale'] = locale;
    }

    // If the data is FormData, remove the Content-Type header
    // so the browser can set the correct multipart/form-data header with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error); // Handle request error
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isSilent = error.config?.metadata?.silent;

    if (status === 401) {
      // Call the unauthorized handler (which will handle logout and routing)
      handleUnauthorized();
    }

    // If this is a silent request, don't show any toasts
    if (isSilent) {
      return Promise.reject(error);
    }

    let errorMessage;

    if (status === 422 && error.response?.data?.errors) {
      const { errors } = error.response.data;

      // Extract all individual error messages
      const errorMessages = Object.values(errors).map(
        (errorArray) => errorArray[0],
      );

      // Show each error message as a separate toast
      errorMessages.forEach((message) => {
        if (message && typeof message === 'string') {
          toast.error(message.trim());
        }
      });
    } else if (status === 422) {
      toast.error(
        error.response?.data?.data?.message ||
          error.response?.data?.message ||
          error.message ||
          'Bad request',
      );
    } else if (status === 400) {
      errorMessage =
        error.response?.data?.data?.message ||
        error.response?.data?.message ||
        error.message ||
        'Bad request';

      toast.error(errorMessage);
    } else {
      errorMessage =
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred';
    }

    // Only show toast for non-422 and non-400 errors (they are handled above)
    if (status !== 422 && status !== 400 && errorMessage) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
