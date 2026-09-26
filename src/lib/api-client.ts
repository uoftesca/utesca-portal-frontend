/**
 * API Client for UTESCA Portal Backend
 *
 * Handles all HTTP requests to the FastAPI backend with authentication.
 */

import { getSupabaseClient } from '@/lib/supabase';
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
  CheckInRequest,
} from '@/types/registration';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

/**
 * Generate and return a string for query parameters
 */
function buildQueryString(params: Record<string, string | number | boolean | undefined> = {}): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  }

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
}

/**
 * Make an authenticated fetch request
 *
 * This is the core auth logic used by all API calls.
 * Returns the Response object for further processing.
 *
 * Token refresh is handled automatically by Supabase's singleton client.
 * getSession() reads from memory/storage and does NOT trigger refreshes.
 *
 * @param endpoint - API endpoint (e.g., '/auth/me')
 * @param options - Fetch options
 * @returns Response object
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {},
  queryParams?: Record<string, string | number | boolean | undefined>
): Promise<Response> {
  const supabase = getSupabaseClient();

  // Get current session (reads from memory, does not trigger refresh)
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No access token available. Please sign in.');
  }

  const queryString = buildQueryString(queryParams);

  // Make request with access token
  const response = await fetch(`${API_BASE_URL}${endpoint}${queryString}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  // If we get 401, the token is expired or invalid
  // Supabase will auto-refresh in the background
  // React Query will retry with the refreshed token
  if (response.status === 401) {
    console.warn('[API Client] Received 401 - token expired, React Query will retry with refreshed token');
    throw new Error('Authentication failed. Token may have expired.');
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
  options: RequestInit = {},
  queryParams?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const response = await authenticatedFetch(
    endpoint,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
    queryParams
  );

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
    return apiRequest(
      '/departments',
      {},
      { year: params?.year, all: params?.all }
    );
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
    return apiRequest(
      '/users',
      {},
      {
        department_id: params?.departmentId,
        role: params?.role,
        year: params?.year,
        search: params?.search,
        page: params?.page,
        page_size: params?.pageSize
      }
    );
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
    return apiRequest(
      '/events',
      {},
      { status: params?.status }
    );
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
    return apiRequest(
      `/portal/events/${params.eventId}/registrations`, {},
      {
        status: params.status,
        page: params.page,
        limit: params.limit,
        search: params.search
      }
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

  exportRegistrations: async (eventId: string, status?: RegistrationStatus): Promise<{ blob: Blob; filename: string }> => {
    const response = await authenticatedFetch(
      `/portal/events/${eventId}/registrations/export`, {}, { status: status }
    );

    if (!response.ok) {
      throw new Error(`Failed to export registrations: ${response.status}`);
    }

    // Extract filename from Content-Disposition header; fall back to eventId
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/);
    const filename = match?.[1] || `event-registrations-${eventId}.csv`;

    return { blob: await response.blob(), filename };
  },

  downloadRegistrationFiles: async (eventId: string): Promise<{ blob: Blob; filename: string; errorCount: number }> => {
    const response = await authenticatedFetch(
      `/portal/events/${eventId}/registrations/files/download`
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(detail || `Failed to download files: ${response.status}`);
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/);
    const filename = match?.[1] || `${eventId}-files.zip`;

    const errorCount = Number(response.headers.get('X-Download-Errors') || '0');

    return { blob: await response.blob(), filename, errorCount };
  },

  checkIn: async (registrationId: string, data: CheckInRequest) => {
    return apiRequest(`/portal/registrations/${registrationId}/check-in`,{
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
