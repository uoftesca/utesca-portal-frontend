/**
 * TypeScript types for Team Management
 */

export type UserRole = 'co_president' | 'vp' | 'director';

export type EmailNotificationPreference = 'all' | 'urgent_only' | 'none';

export interface Department {
  id: string;
  name: string;
  year: number;
  created_at: string;
}

export interface DepartmentListResponse {
  year: number | null;
  departments: Department[];
}

export interface YearsResponse {
  years: number[];
  current_year: number;
}

export interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  display_role: string;
  department_id: string | null;
  preferred_name: string | null;
  photo_url: string | null;
  invited_by: string | null;
  announcement_email_preference: EmailNotificationPreference;
  created_at: string;
  updated_at: string;
}

export interface InviteUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  display_role: string;
  department_id?: string;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  email: string;
}
