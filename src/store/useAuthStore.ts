import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { toastError, toastInfo, toastSuccess } from '../lib/toast';
import type { User, LoginFormData, RegisterFormData, ApiResponse } from '../lib/type';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<ApiResponse>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateToken: (accessToken: string) => void; // ADD THIS METHOD
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with API call
      login: async (data: LoginFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(data);

          if (response.success && response.data) {
            const { token, refreshToken, user } = response.data;

            set({
              user,
              accessToken: token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });

            toastSuccess('Login successful!');
          } else {
            set({ error: response.message || 'Login failed', isLoading: false });
            toastError(response.message || 'Login failed');
          }
        } catch (error: any) {
          // Handle validation errors with details
          let errorMsg = error.error?.message || 'Login failed';
          
          // If there are validation details, format them nicely
          if (error.error?.details && Array.isArray(error.error.details)) {
            const validationMessages = error.error.details
              .map((detail: any) => detail.message)
              .join('. ');
            errorMsg = validationMessages || errorMsg;
          }
          
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
        }
      },

      // Register with API call
      register: async (data: RegisterFormData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);

          if (response.success) {
            toastSuccess('Registration successful! Please check your email for OTP.');
            set({ isLoading: false });
          } else {
            set({ error: response.message, isLoading: false });
            toastError(response.message || 'Registration failed');
          }

          return response;
        } catch (error: any) {
          // Handle validation errors with details
          let errorMsg = error.error?.message || 'Registration failed';
          
          // If there are validation details, format them nicely
          if (error.error?.details && Array.isArray(error.error.details)) {
            const validationMessages = error.error.details
              .map((detail: any) => detail.message)
              .join('. ');
            errorMsg = validationMessages || errorMsg;
          }
          
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
          throw error;
        }
      },

      // Verify OTP with API call
      verifyOTP: async (email: string, otpCode: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.verifyOTP(email, otpCode);

          if (response.success && response.data) {
            const { token, refreshToken, user } = response.data;

            set({
              user,
              accessToken: token,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
            });

            toastSuccess('Account verified successfully!');
          } else {
            set({ error: response.message || 'OTP verification failed', isLoading: false });
            toastError(response.message || 'OTP verification failed');
          }
        } catch (error: any) {
          const errorMsg = error.error?.message || 'OTP verification failed';
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
        }
      },

      // Resend OTP with API call
      resendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.resendOTP(email);

          if (response.success) {
            toastSuccess('OTP resent successfully! Please check your email.');
            set({ isLoading: false });
          } else {
            set({ error: response.message || 'Failed to resend OTP', isLoading: false });
            toastError(response.message || 'Failed to resend OTP');
          }
        } catch (error: any) {
          const errorMsg = error.error?.message || 'Failed to resend OTP';
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
        }
      },

      // Load current user from API
      loadUser: async () => {
        const token = get().accessToken;
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authService.getCurrentUser();

          if (response.success && response.data) {
            set({ user: response.data, isLoading: false });
          } else {
            set({ isLoading: false });
            // Token might be invalid, logout
            get().logout();
          }
        } catch (error) {
          set({ isLoading: false });
          // Token invalid, logout
          get().logout();
        }
      },

      // Update profile with API call
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(data);

          if (response.success && response.data) {
            set({ user: response.data, isLoading: false });
            toastSuccess('Profile updated successfully!');
          } else {
            set({ error: response.message || 'Update failed', isLoading: false });
            toastError(response.message || 'Update failed');
          }
        } catch (error: any) {
          const errorMsg = error.error?.message || 'Update failed';
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
        }
      },

      // Change password with API call
      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.changePassword(currentPassword, newPassword);

          if (response.success) {
            set({ isLoading: false });
            toastSuccess('Password changed successfully!');
          } else {
            set({ error: response.message || 'Password change failed', isLoading: false });
            toastError(response.message || 'Password change failed');
          }
        } catch (error: any) {
          const errorMsg = error.error?.message || 'Password change failed';
          set({ error: errorMsg, isLoading: false });
          toastError(errorMsg);
          throw error;
        }
      },

      // Update token (used by axios interceptor) - ADD THIS METHOD
      updateToken: (accessToken: string) => {
        set({ accessToken });
      },

      // Logout
      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Even if logout fails on backend, clear local state
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          toastInfo('Logged out successfully');
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state: any) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);