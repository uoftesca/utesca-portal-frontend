/**
 * TypeScript types for User and Authentication
 */

export type UserRole = 'co_president' | 'vp' | 'director';

export type EmailNotificationPreference = 'all' | 'urgent_only' | 'none';

/**
 * Granular notification preferences stored as JSONB in database.
 *
 * Allows users to control which types of email notifications they receive.
 * Role-agnostic: any user can opt-in to any notification type.
 */
export interface NotificationPreferences {
  announcements: EmailNotificationPreference;
  rsvpChanges: boolean;
  newApplicationSubmitted: boolean;
}

/**
 * Re-export User type from team.ts for convenience
 * This represents user data from the backend (both /auth/me and team management endpoints)
 */
export type { User } from './team';

/**
 * Query parameters for getting users
 */
export interface GetUsersParams {
  departmentId?: string;
  role?: string;
  year?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}
