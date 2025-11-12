/**
 * Event status types matching backend EventStatus enum
 */
export type EventStatus = 'draft' | 'pending_approval' | 'sent_back' | 'published';

/**
 * Base event fields shared between create and update
 */
export interface BaseEventFields {
  title?: string;
  description?: string;
  dateTime?: string;
  location?: string;
  registrationDeadline?: string;
  status?: EventStatus;
  registrationFormSchema?: Record<string, unknown>;
  maxCapacity?: number;
  imageUrl?: string;
  category?: string;
  imagePosition?: string;
  albumLink?: string;
  registrationLink?: string;
}

/**
 * Request type for creating a new event
 */
export interface CreateEventRequest extends BaseEventFields {
  title: string; // Required for create
  dateTime: string; // Required for create
}

/**
 * Request type for updating an event (all fields optional)
 */
export type UpdateEventRequest = Partial<CreateEventRequest>;

/**
 * Complete event object matching backend EventResponse
 */
export interface Event {
  id: string;
  title: string;
  description: string | null;
  dateTime: string;
  location: string | null;
  registrationDeadline: string | null;
  status: EventStatus;
  createdBy: string | null;
  registrationFormSchema: Record<string, unknown> | null;
  maxCapacity: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  category: string | null;
  imagePosition: string | null;
  albumLink: string | null;
  registrationLink: string | null;
}

/**
 * Response type for listing events
 */
export interface EventListResponse {
  events: Event[];
}

/**
 * Query parameters for getting events
 */
export interface GetEventsParams {
  status?: EventStatus;
}
