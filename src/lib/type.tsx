// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  totalPages?: number;
  currentPage?: number;
}

// Error Response
export interface BackendErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    timestamp?: string;
    stack?: string;
  };
}

// Axios Error
export interface CustomAxiosError {
  response?: {
    data: BackendErrorResponse;
    status: number;
    statusText: string;
  };
  message: string;
}

// User Types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'admin';
  studentId?: string;
  department?: string;
  graduationYear?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event Types
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  category: 'academic' | 'social' | 'sports' | 'cultural' | 'career' | 'workshop' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  capacity: number;
  currentAttendees: number;
  createdBy: User | string;
  contactEmail: string;
  contactPhone?: string;
  imageUrl?: string;
  rejectionReason?: string;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

// RSVP Types
export interface RSVP {
  _id: string;
  event: Event | string;
  user: User | string;
  status: 'attending' | 'waitlisted' | 'cancelled';
  numberOfGuests: number;
  dietaryPreferences?: string;
  createdAt: string;
  updatedAt: string;
}

// OTP Types
export interface OTP {
  _id: string;
  email: string;
  code: string;
  purpose: 'registration' | 'login' | 'password_reset' | 'email_verification';
  expiresAt: string;
  attempts: number;
  isVerified: boolean;
  userId?: string;
  createdAt: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
  graduationYear?: number;
}

export interface CreateEventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  capacity: number;
  contactEmail: string;
  contactPhone?: string;
  imageUrl?: string;
}

// Filter Types
export interface EventFilters {
  upcoming?: boolean | string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}