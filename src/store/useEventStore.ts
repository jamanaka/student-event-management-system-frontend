import { create } from 'zustand';
import type { Event, EventFilters, CreateEventFormData } from '../lib/type';
import { eventService } from '../services/event.service';
import { toastError, toastSuccess } from '../lib/toast';

// Request deduplication map
const pendingRequests = new Map<string, Promise<any>>();

// Helper function to create request key
const createRequestKey = (method: string, params?: any): string => {
  return `${method}:${JSON.stringify(params || {})}`;
};

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  pendingEvents: Event[];
  userEvents: Event[];
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    count: number;
  };
  stats: {
    totalEvents: number;
    upcomingEvents: number;
    todayEvents: number;
    categories: number;
  };

  // Actions with API calls
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  fetchPendingEvents: () => Promise<void>;
  fetchUserEvents: (status?: string) => Promise<void>;
  createEvent: (data: CreateEventFormData) => Promise<boolean>;
  updateEvent: (id: string, data: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  approveEvent: (id: string) => Promise<boolean>;
  rejectEvent: (id: string, rejectionReason: string) => Promise<boolean>;
  clearEvents: () => void;
  clearError: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedEvent: null,
  pendingEvents: [],
  userEvents: [],
  loading: false,
  error: null,
  stats: {
    totalEvents: 0,
    upcomingEvents: 0,
    todayEvents: 0,
    categories: 0,
  },
  filters: {
    page: 1,
    limit: 9,
    search: '',
    category: '',
    status: 'approved',
    sort: 'date',
  },
  pagination: {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    count: 0,
  },

  // Fetch events with API call
  fetchEvents: async (filters?: EventFilters) => {
    const currentFilters = { ...get().filters, ...filters };
    const requestKey = createRequestKey('fetchEvents', currentFilters);
    
    // Check if request is already pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    // Create new request
    const requestPromise = (async () => {
      set({ loading: true, error: null, filters: currentFilters });

      try {
        const response = await eventService.getEvents(currentFilters);

        if (response.success) {
          // Backend returns: { success: true, data: events[], total, totalPages, currentPage, count }
          // After axios interceptor, response is already response.data from axios
          const eventsData = response.data || [];
          const paginationData = {
            total: response.total || 0,
            totalPages: response.totalPages || 1,
            currentPage: response.currentPage || currentFilters.page || 1,
            count: typeof response.count === 'number'
              ? response.count
              : (Array.isArray(eventsData) ? eventsData.length : 0),
          };

          set({
            events: Array.isArray(eventsData) ? eventsData : [],
            loading: false,
            pagination: paginationData,
            stats: response.stats || {
              totalEvents: 0,
              upcomingEvents: 0,
              todayEvents: 0,
              categories: 0,
            }
          });
        } else {
          set({ error: response.message || 'Failed to fetch events', loading: false });
          toastError(response.message || 'Failed to fetch events');
        }
      } catch (error: any) {
        const errorMsg = error.error?.message || error.message || 'Failed to fetch events';
        set({ error: errorMsg, loading: false });
        toastError(errorMsg);
      } finally {
        // Remove from pending requests
        pendingRequests.delete(requestKey);
      }
    })();

    // Store pending request
    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  // Fetch single event by ID
  fetchEventById: async (id: string) => {
    const requestKey = createRequestKey('fetchEventById', { id });
    
    // Check if request is already pending
    if (pendingRequests.has(requestKey)) {
      return pendingRequests.get(requestKey);
    }

    const requestPromise = (async () => {
      set({ loading: true, error: null });

      try {
        const response = await eventService.getEventById(id);

        if (response.success && response.data) {
          set({
            selectedEvent: response.data,
            loading: false
          });
        } else {
          set({ error: response.message || 'Event not found', loading: false });
          toastError(response.message || 'Event not found');
        }
      } catch (error: any) {
        const errorMsg = error.error?.message || 'Failed to fetch event';
        set({ error: errorMsg, loading: false });
        toastError(errorMsg);
      } finally {
        pendingRequests.delete(requestKey);
      }
    })();

    pendingRequests.set(requestKey, requestPromise);
    return requestPromise;
  },

  // Fetch pending events (admin only)
  fetchPendingEvents: async () => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.getPendingEvents();

      if (response.success && response.data) {
        set({
          pendingEvents: response.data || [],
          loading: false
        });
      } else {
        set({ error: response.message || 'Failed to fetch pending events', loading: false });
        toastError(response.message || 'Failed to fetch pending events');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch pending events';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Fetch user's events
  fetchUserEvents: async (status?: string) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.getUserEvents(status);

      if (response.success && response.data) {
        set({
          userEvents: response.data || [],
          loading: false
        });
      } else {
        set({ error: response.message || 'Failed to fetch your events', loading: false });
        toastError(response.message || 'Failed to fetch your events');
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to fetch your events';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
    }
  },

  // Create new event
  createEvent: async (data: CreateEventFormData) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.createEvent(data);

      if (response.success && response.data) {
        set((state) => ({
          events: [response.data!, ...state.events],
          userEvents: [response.data!, ...state.userEvents],
          loading: false
        }));
        toastSuccess('Event created successfully! Pending admin approval.');
        return true;
      } else {
        set({ error: response.message || 'Failed to create event', loading: false });
        toastError(response.message || 'Failed to create event');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to create event';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Update event
  updateEvent: async (id: string, data: Partial<Event>) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.updateEvent(id, data);

      if (response.success && response.data) {
        set((state) => ({
          events: state.events.map(event =>
            event._id === id ? response.data! : event
          ),
          selectedEvent: state.selectedEvent?._id === id
            ? response.data!
            : state.selectedEvent,
          userEvents: state.userEvents.map(event =>
            event._id === id ? response.data! : event
          ),
          loading: false
        }));
        toastSuccess('Event updated successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to update event', loading: false });
        toastError(response.message || 'Failed to update event');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to update event';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Delete event
  deleteEvent: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.deleteEvent(id);

      if (response.success) {
        set((state) => ({
          events: state.events.filter(event => event._id !== id),
          selectedEvent: state.selectedEvent?._id === id ? null : state.selectedEvent,
          userEvents: state.userEvents.filter(event => event._id !== id),
          pendingEvents: state.pendingEvents.filter(event => event._id !== id),
          loading: false
        }));
        toastSuccess('Event deleted successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to delete event', loading: false });
        toastError(response.message || 'Failed to delete event');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to delete event';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Approve event (admin only)
  approveEvent: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.approveEvent(id);

      if (response.success && response.data) {
        set((state) => ({
          pendingEvents: state.pendingEvents.filter(event => event._id !== id),
          events: [response.data!, ...state.events],
          loading: false
        }));
        toastSuccess('Event approved successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to approve event', loading: false });
        toastError(response.message || 'Failed to approve event');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to approve event';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Reject event (admin only)
  rejectEvent: async (id: string, rejectionReason: string) => {
    set({ loading: true, error: null });

    try {
      const response = await eventService.rejectEvent(id, rejectionReason);

      if (response.success && response.data) {
        set((state) => ({
          pendingEvents: state.pendingEvents.filter(event => event._id !== id),
          loading: false
        }));
        toastSuccess('Event rejected successfully!');
        return true;
      } else {
        set({ error: response.message || 'Failed to reject event', loading: false });
        toastError(response.message || 'Failed to reject event');
        return false;
      }
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Failed to reject event';
      set({ error: errorMsg, loading: false });
      toastError(errorMsg);
      return false;
    }
  },

  // Clear events
  clearEvents: () => set({
    events: [],
    selectedEvent: null,
    pendingEvents: [],
    userEvents: [],
    error: null
  }),

  // Clear error
  clearError: () => set({ error: null }),
}));