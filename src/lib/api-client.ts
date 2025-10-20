/**
 * API Client for UTESCA Portal Backend
 *
 * Handles all HTTP requests to the FastAPI backend with authentication.
 */

import { createClient } from '@/lib/supabase';

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
  getDepartments: async (params?: { year?: number; all?: boolean }) => {
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
  inviteUser: async (data: {
    email: string;
    first_name: string;
    last_name: string;
    role: 'co_president' | 'vp' | 'director';
    display_role: string;
    department_id?: string;
  }) => {
    return apiRequest('/auth/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};
