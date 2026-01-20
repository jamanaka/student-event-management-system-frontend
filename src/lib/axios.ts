import axios from 'axios';
import type { CustomAxiosError, BackendErrorResponse } from './type';
import { useAuthStore } from '../store/useAuthStore';
import { toastError } from './toast';

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : `${process.env.REACT_APP_API_BASE_URL_PROD}/api`,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }, 
});

// Request interceptor - Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // You can transform response data here if needed
    return response.data;
  },
  (error: CustomAxiosError) => {
    const originalRequest = (error as any)?.config;

    // Create consistent error format early
    const errorData: BackendErrorResponse = error.response?.data || {
      success: false,
      error: {
        message: error.message || 'Network error occurred',
        code: 'NETWORK_ERROR',
      },
    };

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry login requests - let them fail naturally
      if (originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register') ||
          originalRequest.url?.includes('/auth/verify-otp') ||
          originalRequest.url?.includes('/auth/resend-otp') ||
          originalRequest.url?.includes('/auth/request-password-reset') ||
          originalRequest.url?.includes('/auth/reset-password')) {
        return Promise.reject(errorData);
      }

      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        return axiosInstance
          .post('/auth/refresh-token', { refreshToken })
          .then((response) => {
            if (response.data.success && response.data.data?.token) {
              const { token } = response.data.data;

              // Update store with new token
              useAuthStore.getState().updateToken(token);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            } else {
              throw new Error('Invalid refresh response');
            }
          })
          .catch((refreshError) => {
            // Refresh failed, logout user
            console.error('Token refresh failed:', refreshError);
            useAuthStore.getState().logout();
            // Use window.location for full page redirect after logout
            window.location.href = '/login';
            return Promise.reject(refreshError);
          });
      } else {
        // No refresh token, logout
        useAuthStore.getState().logout();
        // Use window.location for full page redirect after logout
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden - IMPROVED
    if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error?.message || 
        'Access forbidden. You do not have permission to perform this action.';
      
      toastError(errorMessage);
      
      // Optionally redirect non-admin users trying to access admin routes
      if (errorMessage.includes('admin') || errorMessage.includes('Admin')) {
        setTimeout(() => {
          window.location.href = '/users/dashboard';
        }, 2000);
      }
    }

    return Promise.reject(errorData);
  }
);

export default axiosInstance;