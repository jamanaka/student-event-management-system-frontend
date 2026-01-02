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
    console.log('[RSVP Store] fetchUserRSVPs called with params:', params);
    set({ loading: true, error: null });

    try {
      const response = await rsvpService.getUserRSVPs(params);
      console.log('[RSVP Store] Full response received:', response);
      console.log('[RSVP Store] Response type check:', {
        success: response.success,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        isObject: typeof response.data === 'object' && response.data !== null,
        dataKeys: response.data && typeof response.data === 'object' && !Array.isArray(response.data) ? Object.keys(response.data) : [],
        directArrayLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        nestedDataExists: !!(response.data && typeof response.data === 'object' && !Array.isArray(response.data) && 'data' in response.data),
        nestedDataIsArray: Array.isArray((response.data as any)?.data),
        nestedDataLength: Array.isArray((response.data as any)?.data) ? (response.data as any).data.length : 0,
        total: (response.data as any)?.total || 0,
        count: (response.data as any)?.count || 0,
        firstItem: Array.isArray((response.data as any)?.data) ? (response.data as any).data[0] : (Array.isArray(response.data) ? response.data[0] : 'N/A')
      });

      // Handle response structure: { success: true, data: [...], total: 2, ... }
      // Axios interceptor already unwraps response.data, so response is the backend's JSON
      let rsvpsData: any[] = [];
      let paginationData = {
        total: 0,
        totalPages: 1,
        currentPage: 1,
        count: 0
      };

      if (response.success) {
        // Backend returns: { success: true, data: [...], total: 2, count: 2, ... }
        // Axios interceptor returns response.data, so response = { success: true, data: [...], total: 2, ... }
        // So response.data should be the array directly
        const responseData = response.data as any;
        
        if (Array.isArray(responseData)) {
          // Data is directly an array (after axios interceptor unwraps)
          rsvpsData = responseData;
          paginationData = {
            total: (response as any).total || responseData.length,
            totalPages: (response as any).totalPages || 1,
            currentPage: (response as any).currentPage || 1,
            count: (response as any).count || responseData.length,
          };
        } else if (responseData && typeof responseData === 'object' && Array.isArray(responseData.data)) {
          // Data is nested: { data: [...], total: ... } (if interceptor didn't unwrap)
          rsvpsData = responseData.data;
          paginationData = {
            total: responseData.total || 0,
            totalPages: responseData.totalPages || 1,
            currentPage: responseData.currentPage || 1,
            count: responseData.count || 0,
          };
        } else {
          // Check if response itself has data property at top level
          // Backend returns: { success: true, data: [...], total: 2, ... }
          // After axios interceptor unwraps: response = { success: true, data: [...], total: 2, ... }
          // So response.data might be the array, or response itself might have the data
          const responseAny = response as any;
          if (responseAny.data && Array.isArray(responseAny.data)) {
            rsvpsData = responseAny.data;
            paginationData = {
              total: responseAny.total || 0,
              totalPages: responseAny.totalPages || 1,
              currentPage: responseAny.currentPage || 1,
              count: responseAny.count || 0,
            };
          } else {
            console.warn('[RSVP Store] Unexpected response structure:', response);
            rsvpsData = [];
          }
        }
      }

      console.log('[RSVP Store] Extracted RSVPs:', {
        count: rsvpsData.length,
        rsvps: rsvpsData.map(r => ({
          id: r?._id || r?.id,
          eventId: typeof r?.event === 'string' ? r.event : r?.event?._id || r?.event?.id,
          eventTitle: typeof r?.event === 'string' ? 'STRING' : r?.event?.title,
          hasEvent: !!r?.event,
          numberOfGuests: r?.numberOfGuests
        }))
      });
      
      set({
        rsvps: rsvpsData,
        pagination: paginationData,
        loading: false
      });
      console.log('[RSVP Store] RSVPs set successfully, count:', rsvpsData.length);
    } catch (error: any) {
      console.error('[RSVP Store] Error fetching RSVPs:', error);
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