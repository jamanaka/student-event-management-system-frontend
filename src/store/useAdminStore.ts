import { create } from 'zustand';
import { adminService } from '../services/admin.service';
import type { User } from '../lib/type';
import type { UserFilters, SystemStats, UserWithStats } from '../services/admin.service';
import { toastError, toastSuccess } from '../lib/toast';

interface AdminState {
  users: User[];
  selectedUser: UserWithStats | null;
  systemStats: SystemStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    count: number;
  };

  // Actions
  fetchAllUsers: (filters?: UserFilters) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  updateUserStatus: (id: string, isActive: boolean) => Promise<boolean>;
  updateUserRole: (id: string, role: 'student' | 'admin') => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  fetchSystemStats: () => Promise<void>;
  clearUsers: () => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  selectedUser: null,
  systemStats: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    count: 0,
  },

  // Fetch all users
  fetchAllUsers: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.getAllUsers(filters);

      if (response.success) {
        // Backend returns: { success: true, data: users[], total, totalPages, currentPage, count }
        // After axios interceptor, response is already response.data from axios
        let usersData: User[] = [];
        
        // Handle different response structures
        if (Array.isArray(response.data)) {
          usersData = response.data as User[];
        } else if (response.data && Array.isArray(response.data.data)) {
          usersData = response.data.data as User[];
        } else if (Array.isArray(response)) {
          usersData = response as User[];
        }
        
        const paginationData = {
          total: response.total || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || filters.page || 1,
          count: response.count || usersData.length,
        };

        set({
          users: usersData,
          pagination: paginationData,
          loading: false,
        });
      } else {
        set({ 
          users: [], // Ensure users is always an array
          error: response.message || 'Failed to fetch users', 
          loading: false 
        });
        toastError(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || error.message || 'Failed to fetch users';
      set({ 
        users: [], // Ensure users is always an array even on error
        error: errorMsg, 
        loading: false 
      });
      toastError(errorMsg);
    }
  },

  // Fetch user by ID
  fetchUserById: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.getUserById(id);

      if (response.success && response.data) {
        set({
          selectedUser: response.data,
          loading: false,
        });
      } else {
        set({ error: response.message || 'Failed to fetch user', loading: false });
        toastError(response.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch user';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Update user status
  updateUserStatus: async (id: string, isActive: boolean) => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.updateUserStatus(id, isActive);

      if (response.success && response.data) {
        // Update user in list
        set((state) => ({
          users: state.users.map((user) =>
            user._id === id ? response.data! : user
          ),
          loading: false,
        }));

        toastSuccess(
          `User ${isActive ? 'activated' : 'deactivated'} successfully!`
        );
        return true;
      } else {
        set({ error: response.message || 'Failed to update user status', loading: false });
        toastError(response.message || 'Failed to update user status');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to update user status';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Update user role
  updateUserRole: async (id: string, role: 'student' | 'admin') => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.updateUserRole(id, role);

      if (response.success && response.data) {
        // Update user in list
        set((state) => ({
          users: state.users.map((user) =>
            user._id === id ? response.data! : user
          ),
          loading: false,
        }));

        toastSuccess('User role updated successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to update user role', loading: false });
        toastError(response.message || 'Failed to update user role');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to update user role';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Delete user
  deleteUser: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.deleteUser(id);

      if (response.success) {
        // Remove user from list
        set((state) => ({
          users: state.users.filter((user) => user._id !== id),
          loading: false,
        }));

        toastSuccess('User deleted successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to delete user', loading: false });
        toastError(response.message || 'Failed to delete user');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to delete user';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Fetch system statistics
  fetchSystemStats: async () => {
    set({ loading: true, error: null });

    try {
      const response = await adminService.getSystemStats();

      if (response.success && response.data) {
        set({
          systemStats: response.data,
          loading: false,
        });
      } else {
        set({ error: response.message || 'Failed to fetch statistics', loading: false });
        toastError(response.message || 'Failed to fetch statistics');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch statistics';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Clear users
  clearUsers: () => set({
    users: [],
    selectedUser: null,
    error: null,
    pagination: {
      total: 0,
      totalPages: 1,
      currentPage: 1,
      count: 0,
    },
  }),

  // Clear error
  clearError: () => set({ error: null }),
}));

// Selector hooks for better performance
export const useAdminUsers = () => useAdminStore((state) => state.users);
export const useAdminSelectedUser = () => useAdminStore((state) => state.selectedUser);
export const useAdminSystemStats = () => useAdminStore((state) => state.systemStats);
export const useAdminLoading = () => useAdminStore((state) => state.loading);
export const useAdminError = () => useAdminStore((state) => state.error);
export const useAdminPagination = () => useAdminStore((state) => state.pagination);

