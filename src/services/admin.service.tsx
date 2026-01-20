import { axiosInstance } from '../lib/axios';
import type { User, ApiResponse } from '../lib/type';

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'student' | 'admin';
  isActive?: boolean;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: Array<{ _id: string; count: number }>;
  };
  events: {
    total: number;
    approved: number;
    pending: number;
    upcoming: number;
    byCategory: Array<{ _id: string; count: number }>;
  };
  rsvps: {
    total: number;
  };
  recentActivity: {
    eventsCreated: number;
    usersRegistered: number;
    period: string;
  };
  todayActivity: {
    eventsApproved: number;
    eventsRejected: number;
    rsvpsMade: number;
  };
}

export interface UserWithStats extends User {
  stats?: {
    eventsCreated: number;
    rsvpsCount: number;
  };
}

export const adminService = {
  // Get all users (admin only)
  async getAllUsers(filters?: UserFilters): Promise<ApiResponse<{
    data: User[];
    count: number;
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    return axiosInstance.get('/admin/users', { params: filters });
  },

  // Get user by ID (admin only)
  async getUserById(id: string): Promise<ApiResponse<UserWithStats>> {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  // Update user status (activate/deactivate)
  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return axiosInstance.patch(`/admin/users/${id}/status`, { isActive });
  },

  // Update user role
  async updateUserRole(id: string, role: 'student' | 'admin'): Promise<ApiResponse<User>> {
    return axiosInstance.patch(`/admin/users/${id}/role`, { role });
  },

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse> {
    return axiosInstance.delete(`/admin/users/${id}`);
  },

  // Get system statistics
  async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    return axiosInstance.get('/admin/stats');
  }
};

