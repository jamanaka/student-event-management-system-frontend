import { axiosInstance } from '../lib/axios';
import type { RSVP, ApiResponse } from '../lib/type';

export const rsvpService = {
  // Add RSVP
  async addRSVP(eventId: string, data?: { 
    numberOfGuests?: number; 
    dietaryPreferences?: string 
  }): Promise<ApiResponse<RSVP>> {
    return axiosInstance.post(`/events/${eventId}/rsvp`, data);
  },

  // Remove RSVP
  async removeRSVP(eventId: string): Promise<ApiResponse> {
    return axiosInstance.delete(`/events/${eventId}/rsvp`);
  },

  // Get event attendees
  async getEventAttendees(eventId: string, params?: { 
    page?: number; 
    limit?: number 
  }): Promise<ApiResponse<{
    data: RSVP[];
    count: number;
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    return axiosInstance.get(`/events/${eventId}/rsvp/attendees`, { params });
  },

  // Get user's RSVPs
  async getUserRSVPs(params?: { 
    page?: number; 
    limit?: number; 
    status?: 'upcoming' | 'past' 
  }): Promise<ApiResponse<{
    data: RSVP[];
    count: number;
    total: number;
    totalPages: number;
    currentPage: number;
  }>> {
    return axiosInstance.get('/rsvp/my-rsvps', { params });
  },

  // Check RSVP status
  async checkRSVPStatus(eventId: string): Promise<ApiResponse<{
    hasRSVPed: boolean;
    rsvp: RSVP | null;
  }>> {
    return axiosInstance.get(`/events/${eventId}/rsvp`);
  },

  // Update RSVP
  async updateRSVP(eventId: string, data: { 
    numberOfGuests?: number; 
    dietaryPreferences?: string 
  }): Promise<ApiResponse<RSVP>> {
    return axiosInstance.put(`/events/${eventId}/rsvp`, data);
  }
};