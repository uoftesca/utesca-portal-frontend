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
 * Query parameters for getting events
 */
export interface GetEventsParams {
  status?: EventStatus;
}

