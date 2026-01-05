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
 * User profile type matching the backend /auth/me response
 */
export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  role: UserRole;
  displayRole: string;
  departmentId: string | null;
  photoUrl: string | null;
  notificationPreferences: NotificationPreferences;
  linkedinUrl: string | null;
  invitedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

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
