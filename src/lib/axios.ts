import axios from 'axios';
import type { CustomAxiosError, BackendErrorResponse } from './type';
import { useAuthStore } from '../store/useAuthStore';
import { toastError } from './toast';

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : `${process.env.NEXT_PUBLIC_API_BASE_URL_PROD}/api`,
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

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        return axiosInstance
          .post('/auth/refresh-token', { refreshToken })
          .then((response) => {
            const { token } = response.data.data;

            // Update store with new token
            useAuthStore.getState().updateToken(token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((refreshError) => {
            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          });
      } else {
        // No refresh token, logout
        useAuthStore.getState().logout();
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

    // Return consistent error format
    const errorData: BackendErrorResponse = error.response?.data || {
      success: false,
      error: {
        message: error.message || 'Network error occurred',
        code: 'NETWORK_ERROR',
      },
    };

    return Promise.reject(errorData);
  }
);

export default axiosInstance;