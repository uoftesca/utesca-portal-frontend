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
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  role: UserRole;
  displayRole: string;
  departmentId: string | null;
  photoUrl: string | null;
  announcementEmailPreference: EmailNotificationPreference;
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
