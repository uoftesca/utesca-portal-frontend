/**
 * Event Registration Types
 *
 * Type definitions for event registration system matching backend Pydantic models
 * from domains/events/registrations/models.py
 */

export type RegistrationStatus = 'submitted' | 'accepted' | 'rejected' | 'confirmed';

/**
 * File metadata for uploaded files (resumes, etc.)
 */
export interface FileMeta {
  id: string;
  registrationId: string | null;
  eventId: string;
  fieldName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadSessionId: string;
  uploadedAt: string;
  scheduledDeletionDate: string | null;
  deleted: boolean;
  deletedAt: string | null;
}

/**
 * Base registration data
 */
export interface Registration {
  id: string;
  eventId: string;
  formData: Record<string, unknown>;
  status: RegistrationStatus;
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rsvpToken: string | null;
  confirmedAt: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registration with uploaded files included
 */
export interface RegistrationWithFiles extends Registration {
  files: FileMeta[];
}

/**
 * Pagination metadata
 */
export interface RegistrationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List response from API
 */
export interface RegistrationListResponse {
  registrations: Registration[];
  pagination: RegistrationPagination;
}

/**
 * Detail response from API (includes files)
 */
export interface RegistrationDetailResponse {
  registration: RegistrationWithFiles;
}

/**
 * Status update request payload
 */
export interface RegistrationStatusUpdate {
  status: 'accepted' | 'rejected';
}

/**
 * Status update response from API
 */
export interface RegistrationStatusUpdateResponse {
  success: boolean;
  registration: Registration;
  rsvpLink?: string; // Only present when status is 'accepted'
}

/**
 * Query parameters for listing registrations
 */
export interface GetRegistrationsParams {
  eventId: string;
  status?: RegistrationStatus;
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Status breakdown for tab badge counts
 */
export interface StatusCounts {
  submitted: number;
  accepted: number;
  rejected: number;
  confirmed: number;
}

/**
 * Form field definition in registration form schema
 */
export interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  validation?: Record<string, unknown>;
  options?: string[];
}

/**
 * Registration form schema structure stored in events table
 */
export interface RegistrationFormSchema {
  autoAccept?: boolean;
  fields: FormField[];
}
