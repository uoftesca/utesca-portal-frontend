/**
 * TypeScript types for User and Authentication
 */

export type UserRole = 'co_president' | 'vp' | 'director';

export type EmailNotificationPreference = 'all' | 'urgent_only' | 'none';

/**
 * User profile type matching the backend /auth/me response
 */
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  role: UserRole;
  display_role: string;
  department_id: string | null;
  photo_url: string | null;
  announcement_email_preference: EmailNotificationPreference;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}
