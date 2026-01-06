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
import {
  GetRegistrationsParams,
  RegistrationStatusUpdate,
  RegistrationStatus,
} from '@/types/registration';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Make an authenticated fetch request with automatic token refresh on 401
 *
 * This is the core auth + retry logic used by all API calls.
 * Returns the Response object for further processing.
 *
 * @param endpoint - API endpoint (e.g., '/auth/me')
 * @param options - Fetch options
 * @returns Response object
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const supabase = createClient();

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No access token available. Please sign in.');
  }

  // Make initial request
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  // Handle 401 (Unauthorized) - token may have expired
  if (response.status === 401) {
    console.warn('[API Client] Received 401, attempting to refresh token and retry');

    // Attempt to refresh the session
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      console.error('[API Client] Token refresh failed:', error);
      throw new Error('Token refresh failed. Please sign in again.');
    }

    console.log('[API Client] Token refreshed successfully, retrying request');

    // Retry request with new token
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${data.session.access_token}`,
        ...options.headers,
      },
    });
  }

  return response;
}

/**
 * Make an authenticated API request that returns JSON
 *
 * Uses authenticatedFetch for auth + retry, then parses JSON response.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle error responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  // Handle 204 No Content responses (empty body)
  if (response.status === 204) {
    return undefined as T;
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

  // Event Registrations
  getEventRegistrations: async (params: GetRegistrationsParams) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest(
      `/portal/events/${params.eventId}/registrations${queryString}`
    );
  },

  getRegistrationDetail: async (registrationId: string) => {
    return apiRequest(`/portal/registrations/${registrationId}`);
  },

  updateRegistrationStatus: async (
    registrationId: string,
    data: RegistrationStatusUpdate
  ) => {
    return apiRequest(`/portal/registrations/${registrationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  exportRegistrations: async (eventId: string, status?: RegistrationStatus) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    const queryString = query.toString() ? `?${query.toString()}` : '';

    // Use authenticatedFetch for consistent auth + retry logic
    const response = await authenticatedFetch(
      `/portal/events/${eventId}/registrations/export${queryString}`
    );

    if (!response.ok) {
      throw new Error(`Failed to export registrations: ${response.status}`);
    }

    return response.blob();
  },
};
