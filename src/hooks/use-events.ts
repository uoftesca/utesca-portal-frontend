/**
 * React Query hooks for events management
 *
 * Provides query and mutation hooks for fetching, creating, updating, and deleting events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Event,
  EventListResponse,
  CreateEventRequest,
  UpdateEventRequest,
  GetEventsParams,
} from '@/types/event';

/**
 * Query key factory for events
 */
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: GetEventsParams) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

/**
 * Hook to fetch events list with optional filters
 */
export function useEvents(params?: GetEventsParams) {
  return useQuery<EventListResponse, Error>({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getEvents(params);
      return response as EventListResponse;
    },
  });
}

/**
 * Hook to fetch a single event by ID
 */
export function useEvent(eventId: string | null) {
  return useQuery<Event, Error>({
    queryKey: eventKeys.detail(eventId || ''),
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID is required');
      const response = await apiClient.getEventById(eventId);
      return response as Event;
    },
    enabled: !!eventId, // Only run query if eventId is provided
  });
}

/**
 * Hook to create a new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventRequest>({
    mutationFn: async (data: CreateEventRequest) => {
      const response = await apiClient.createEvent(data);
      return response as Event;
    },
    onSuccess: () => {
      // Invalidate all events queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

/**
 * Hook to update an existing event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation<
    Event,
    Error,
    { eventId: string; data: UpdateEventRequest }
  >({
    mutationFn: async ({ eventId, data }) => {
      const response = await apiClient.updateEvent(eventId, data);
      return response as Event;
    },
    onSuccess: (data) => {
      // Invalidate all events queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      // Also update the specific event in cache
      queryClient.setQueryData(eventKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete an event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (eventId: string) => {
      await apiClient.deleteEvent(eventId);
    },
    onSuccess: (_, eventId) => {
      // Invalidate all events queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      // Remove the specific event from cache
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

