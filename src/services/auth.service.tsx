import { axiosInstance } from '../lib/axios';
import type { 
  User, 
  LoginFormData, 
  RegisterFormData, 
  ApiResponse 
} from '../lib/type';

export const authService = {
  // Register
  async register(data: RegisterFormData): Promise<ApiResponse> {
    return axiosInstance.post('/auth/register', data);
  },

  // Verify OTP
  async verifyOTP(email: string, otpCode: string): Promise<ApiResponse<{ 
    token: string; 
    refreshToken: string; 
    user: User 
  }>> {
    return axiosInstance.post('/auth/verify-otp', { email, otpCode });
  },

  // Login
  async login(data: LoginFormData): Promise<ApiResponse<{ 
    token: string; 
    refreshToken: string; 
    user: User 
  }>> {
    return axiosInstance.post('/auth/login', data);
  },

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return axiosInstance.get('/auth/me');
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return axiosInstance.post('/auth/request-password-reset', { email });
  },

  // Reset password
  async resetPassword(email: string, otpCode: string, newPassword: string): Promise<ApiResponse> {
    return axiosInstance.post('/auth/reset-password', { email, otpCode, newPassword });
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return axiosInstance.put('/auth/update-profile', data);
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    return axiosInstance.post('/auth/refresh-token', { refreshToken });
  },

  // Logout (client-side)
  logout(): void {
    // This just clears local storage, backend doesn't need to know
    localStorage.removeItem('auth-storage');
  }
};