import { axiosInstance } from '../lib/axios';
import type { RSVP, ApiResponse } from '../lib/type';

export const rsvpService = {
  // Add RSVP
  async addRSVP(eventId: string, data?: { 
    numberOfGuests?: number; 
    dietaryPreferences?: string 
  }): Promise<ApiResponse<RSVP>> {
    return axiosInstance.post(`/rsvp/${eventId}`, data);
  },

  // Remove RSVP
  async removeRSVP(eventId: string): Promise<ApiResponse> {
    return axiosInstance.delete(`/rsvp/${eventId}`);
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
    return axiosInstance.get(`/rsvp/event/${eventId}/attendees`, { params });
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
    return axiosInstance.get(`/rsvp/check/${eventId}`);
  },

  // Update RSVP
  async updateRSVP(eventId: string, data: { 
    numberOfGuests?: number; 
    dietaryPreferences?: string 
  }): Promise<ApiResponse<RSVP>> {
    return axiosInstance.put(`/rsvp/${eventId}`, data);
  }
};