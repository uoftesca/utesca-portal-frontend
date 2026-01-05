/**
 * TypeScript types for Team Management
 */


import type { UserRole, NotificationPreferences } from './user';

// Re-export user types for convenience so consumers can import from either file
export { type UserRole, type EmailNotificationPreference, type NotificationPreferences } from './user';

export interface Department {
  id: string;
  name: string;
  year: number;
  createdAt: string;
}

export interface DepartmentListResponse {
  year: number | null;
  departments: Department[];
}

export interface YearsResponse {
  years: number[];
  currentYear: number;
}

export interface User {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  displayRole: string;
  departmentId: string | null;
  preferredName: string | null;
  photoUrl: string | null;
  invitedBy: string | null;
  notificationPreferences: NotificationPreferences;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  displayRole: string;
  departmentId?: string;
}

export interface InviteUserResponse {
  success: boolean;
  message: string;
  email: string;
}

export interface UserListResponse {
  total: number;
  users: User[];
  page: number | null;
  pageSize: number | null;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  displayRole?: string;
  role?: UserRole;
  departmentId?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
  deletedUserId: string;
}

/**
 * Query parameters for getting departments
 */
export interface GetDepartmentsParams {
  year?: number;
  all?: boolean;
}
