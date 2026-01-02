import { create } from 'zustand';
import { rsvpService } from '../services/rsvp.service';
import type { RSVP } from '../lib/type';
import { toastError, toastSuccess } from '../lib/toast';

interface RSVPState {
  rsvps: RSVP[]; // User's RSVPs
  eventAttendees: Record<string, RSVP[]>; // Attendees by event ID
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    count: number;
  };
  attendeesPagination: Record<string, {
    total: number;
    totalPages: number;
    currentPage: number;
    count: number;
  }>;

  // Actions with API calls 
  fetchUserRSVPs: (params?: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'past'
  }) => Promise<void>;

  fetchEventAttendees: (eventId: string, params?: {
    page?: number;
    limit?: number
  }) => Promise<void>;

  addRSVP: (eventId: string, data?: {
    numberOfGuests?: number;
    dietaryPreferences?: string
  }) => Promise<boolean>;

  removeRSVP: (eventId: string) => Promise<boolean>;

  updateRSVP: (eventId: string, data: {
    numberOfGuests?: number;
    dietaryPreferences?: string
  }) => Promise<boolean>;

  checkRSVPStatus: (eventId: string) => Promise<{
    hasRSVPed: boolean;
    rsvp: RSVP | null;
  }>;

  clearRSVPs: () => void;
  clearError: () => void;
}

export const useRSVPStore = create<RSVPState>((set, get) => ({
  rsvps: [],
  eventAttendees: {},
  loading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    count: 0,
  },
  attendeesPagination: {},

  // Fetch user's RSVPs
  fetchUserRSVPs: async (params = {}) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.getUserRSVPs(params);

      if (response.success && response.data) {
        set({
          rsvps: response.data.data || [],
          pagination: {
            total: response.data.total || 0,
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.currentPage || 1,
            count: response.data.count || 0,
          },
          loading: false
        });
      } else {
        set({ error: response.message || 'Failed to fetch RSVPs', loading: false });
        toastError(response.message || 'Failed to fetch RSVPs');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch RSVPs';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Fetch event attendees
  fetchEventAttendees: async (eventId: string, params = {}) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.getEventAttendees(eventId, params);

      if (response.success && response.data) {
        set((state) => ({
          eventAttendees: {
            ...state.eventAttendees,
            [eventId]: response.data!.data || []
          },
          attendeesPagination: {
            ...state.attendeesPagination,
            [eventId]: {
              total: response.data!.total || 0,
              totalPages: response.data!.totalPages || 1,
              currentPage: response.data!.currentPage || 1,
              count: response.data!.count || 0,
            }
          },
          loading: false
        }));
      } else {
        set({ error: response.message || 'Failed to fetch attendees', loading: false });
        toastError(response.message || 'Failed to fetch attendees');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch attendees';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Add RSVP to event
  addRSVP: async (eventId: string, data = {}) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.addRSVP(eventId, data);

      if (response.success && response.data) {
        // Add to user's RSVPs
        set((state) => ({
          rsvps: [response.data!, ...state.rsvps],
          loading: false
        }));

        // Update event attendees count in event store if needed
        toastSuccess('RSVP added successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to add RSVP', loading: false });
        toastError(response.message || 'Failed to add RSVP');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to add RSVP';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Remove RSVP from event
  removeRSVP: async (eventId: string) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.removeRSVP(eventId);

      if (response.success) {
        // Remove from user's RSVPs
        set((state) => ({
          rsvps: state.rsvps.filter(rsvp =>
            typeof rsvp.event === 'string'
              ? rsvp.event !== eventId
              : rsvp.event._id !== eventId
          ),
          loading: false
        }));

        toastSuccess('RSVP removed successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to remove RSVP', loading: false });
        toastError(response.message || 'Failed to remove RSVP');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to remove RSVP';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Update RSVP (e.g., number of guests)
  updateRSVP: async (eventId: string, data: {
    numberOfGuests?: number;
    dietaryPreferences?: string
  }) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.updateRSVP(eventId, data);

      if (response.success && response.data) {
        // Update in user's RSVPs
        set((state) => ({
          rsvps: state.rsvps.map(rsvp =>
            (typeof rsvp.event === 'string'
              ? rsvp.event === eventId
              : rsvp.event._id === eventId)
              ? response.data!
              : rsvp
          ),
          loading: false
        }));

        toastSuccess('RSVP updated successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to update RSVP', loading: false });
        toastError(response.message || 'Failed to update RSVP');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to update RSVP';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Check if user has RSVPed to an event
  checkRSVPStatus: async (eventId: string) => {
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.checkRSVPStatus(eventId);

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({ error: response.message || 'Failed to check RSVP status', loading: false });
        toastError(response.message || 'Failed to check RSVP status');
        return { hasRSVPed: false, rsvp: null };
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to check RSVP status';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return { hasRSVPed: false, rsvp: null };
    }
  },

  // Clear RSVPs
  clearRSVPs: () => set({
    rsvps: [],
    eventAttendees: {},
    error: null
  }),

  // Clear error
  clearError: () => set({ error: null }),
}));

// Selector hooks for better performance
export const useRSVPs = () => useRSVPStore((state) => state.rsvps);
export const useEventAttendees = (eventId: string) =>
  useRSVPStore((state) => state.eventAttendees[eventId] || []);
export const useRSVPLoading = () => useRSVPStore((state) => state.loading);
export const useRSVPError = () => useRSVPStore((state) => state.error);