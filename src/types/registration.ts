/**
 * Event Registration Types
 *
 * Type definitions for event registration system matching backend Pydantic models
 * from domains/events/registrations/models.py
 */

export type RegistrationStatus = 'submitted' | 'accepted' | 'rejected' | 'confirmed' | 'not_attending' | 'waitlist' |
  'withdrawn' | 'pending_verification';

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
  confirmedAt: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
  updatedAt: string;
  rsvpLink?: string; // Only present when status is 'accepted'
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
  status: 'accepted' | 'rejected' | 'waitlist';
}

/**
 * Status update response from API
 */
export interface RegistrationStatusUpdateResponse {
  success: boolean;
  registration: Registration;
}

/**
 * Query parameters for listing registrations
 */
export interface GetRegistrationsParams {
  eventId: string;
  status?: RegistrationStatus;
  checkedIn?: boolean;
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
  notAttending: number;
  waitlist: number;
  withdrawn: number;
  pendingVerification: number;
}

/**
 * Attendance breakdown for tab badge counts
 */
export interface AttendanceCounts {
  attended: number;
  absent: number;
}

export type FieldValidationPattern = "name" | "fullName" | "email" | "uoftEmail" | "utorid" | "phoneNumber";
export type FieldValidationAllowedType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";

/**
 * Form field validation schema structure
 */
export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: FieldValidationPattern;
  maxSize?: number;
  allowedTypes?: FieldValidationAllowedType[];
}

export type FormFieldType = "text" | "textarea" | "select" | "radio" | "checkbox" | "file";

/**
 * Form field definition
 */
export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  validation?: FormFieldValidation;
  required: boolean;
  editable: boolean;
}

/**
 * Registration form schema structure stored in events table
 */
export interface RegistrationFormSchema {
  autoAccept?: boolean;
  fields: FormField[];
}

export interface RegistrationUpdateResponse {
  success: boolean;
  status: RegistrationStatus;
  message: string;
}

/**
 * Info for a registration ticket
 */
export interface TicketInfo {
  registrationId: string;
  ticketToken: string;
};

/**
 * Request type for registration check-in
 */
export interface CheckInRequest {
  ticket_token: string;
};

/**
 * Response type for registration check-in
 */
export interface CheckInResponse {
  id: string;
  checkedIn: boolean,
  checkedInAt: string | null;
  checkedInBy: string | null;
};
