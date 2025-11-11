/**
 * API Client for UTESCA Portal Backend
 *
 * Handles all HTTP requests to the FastAPI backend with authentication.
 */

import { createClient } from '@/lib/supabase';
import {
  CreateEventRequest,
  UpdateEventRequest,
  GetEventsParams,
} from '@/types/event';
import { GetUsersParams } from '@/types/user';
import {
  InviteUserRequest,
  UpdateUserRequest,
  GetDepartmentsParams,
} from '@/types/team';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Get the current user's access token from Supabase
 */
async function getAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No access token available. Please sign in.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * API Client
 */
export const apiClient = {
  // Departments
  getDepartments: async (params?: GetDepartmentsParams) => {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year.toString());
    if (params?.all) query.append('all', 'true');
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/departments${queryString}`);
  },

  getAvailableYears: async () => {
    return apiRequest('/departments/years');
  },

  // Auth / Users
  inviteUser: async (data: InviteUserRequest) => {
    return apiRequest('/auth/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Users
  getUsers: async (params?: GetUsersParams) => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('department_id', params.departmentId);
    if (params?.role) query.append('role', params.role);
    if (params?.year) query.append('year', params.year.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.pageSize) query.append('page_size', params.pageSize.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/users${queryString}`);
  },

  getUserById: async (userId: string) => {
    return apiRequest(`/users/${userId}`);
  },

  updateUser: async (userId: string, data: UpdateUserRequest) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUser: async (userId: string) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // Events
  getEvents: async (params?: GetEventsParams) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(`/events${queryString}`);
  },

  getEventById: async (eventId: string) => {
    return apiRequest(`/events/${eventId}`);
  },

  createEvent: async (data: CreateEventRequest) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (eventId: string, data: UpdateEventRequest) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (eventId: string) => {
    return apiRequest(`/events/${eventId}`, {
      method: 'DELETE',
    });
  },
};
