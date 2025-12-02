import { axiosInstance } from '../lib/axios';
import type { 
  Event, 
  CreateEventFormData, 
  EventFilters, 
  ApiResponse 
} from '../lib/type';

export const eventService = {
  // Get all events
  async getEvents(filters?: EventFilters): Promise<ApiResponse<{
    data: Event[];
    count: number;
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    return axiosInstance.get('/events', { params: filters });
  },

  // Get pending events (admin only)
  async getPendingEvents(): Promise<ApiResponse<Event[]>> {
    return axiosInstance.get('/events/pending');
  },

  // Get event by ID
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    return axiosInstance.get(`/events/${id}`);
  },

  // Create event
  async createEvent(data: CreateEventFormData): Promise<ApiResponse<Event>> {
    return axiosInstance.post('/events', data);
  },

  // Update event
  async updateEvent(id: string, data: Partial<Event>): Promise<ApiResponse<Event>> {
    return axiosInstance.put(`/events/${id}`, data);
  },

  // Delete event
  async deleteEvent(id: string): Promise<ApiResponse> {
    return axiosInstance.delete(`/events/${id}`);
  },

  // Approve event (admin only)
  async approveEvent(id: string): Promise<ApiResponse<Event>> {
    return axiosInstance.patch(`/events/${id}/approve`);
  },

  // Reject event (admin only)
  async rejectEvent(id: string, rejectionReason: string): Promise<ApiResponse<Event>> {
    return axiosInstance.patch(`/events/${id}/reject`, { rejectionReason });
  },

  // Get user's events
  async getUserEvents(status?: string): Promise<ApiResponse<Event[]>> {
    const params = status && status !== 'all' ? { status } : {};
    return axiosInstance.get('/events/my-events', { params });
  },

  // Get event statistics (admin only)
  async getEventStats(): Promise<ApiResponse<any>> {
    return axiosInstance.get('/events/stats');
  }
};