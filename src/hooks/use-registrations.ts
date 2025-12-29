/**
 * React Query hooks for event registrations
 *
 * Provides query and mutation hooks for fetching and managing registrations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  RegistrationStatus,
  RegistrationListResponse,
  RegistrationDetailResponse,
  RegistrationStatusUpdate,
  RegistrationStatusUpdateResponse,
  GetRegistrationsParams,
  StatusCounts,
} from '@/types/registration';

/**
 * Query key factory for registrations
 */
export const registrationKeys = {
  all: ['registrations'] as const,
  lists: () => [...registrationKeys.all, 'list'] as const,
  list: (params: GetRegistrationsParams) =>
    [...registrationKeys.lists(), params] as const,
  details: () => [...registrationKeys.all, 'detail'] as const,
  detail: (id: string) => [...registrationKeys.details(), id] as const,
};

/**
 * Hook to fetch registrations list with filters
 */
export function useRegistrations(params: GetRegistrationsParams) {
  return useQuery<RegistrationListResponse, Error>({
    queryKey: registrationKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getEventRegistrations(params);
      return response as RegistrationListResponse;
    },
    enabled: !!params.eventId, // Only run if eventId is provided
  });
}

/**
 * Hook to fetch a single registration with files
 */
export function useRegistration(registrationId: string | null) {
  return useQuery<RegistrationDetailResponse, Error>({
    queryKey: registrationKeys.detail(registrationId || ''),
    queryFn: async () => {
      if (!registrationId) throw new Error('Registration ID is required');
      const response = await apiClient.getRegistrationDetail(registrationId);
      return response as RegistrationDetailResponse;
    },
    enabled: !!registrationId,
  });
}

/**
 * Hook to calculate status counts from pagination totals
 * Fetches each status with limit=1 to get total counts efficiently
 */
export function useRegistrationCounts(eventId: string) {
  const { data: submitted } = useRegistrations({
    eventId,
    status: 'submitted',
    limit: 1,
  });
  const { data: accepted } = useRegistrations({
    eventId,
    status: 'accepted',
    limit: 1,
  });
  const { data: rejected } = useRegistrations({
    eventId,
    status: 'rejected',
    limit: 1,
  });
  const { data: confirmed } = useRegistrations({
    eventId,
    status: 'confirmed',
    limit: 1,
  });

  const counts: StatusCounts = {
    submitted: submitted?.pagination.total || 0,
    accepted: accepted?.pagination.total || 0,
    rejected: rejected?.pagination.total || 0,
    confirmed: confirmed?.pagination.total || 0,
  };

  return { data: counts };
}

/**
 * Hook to update registration status (accept/reject)
 */
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    RegistrationStatusUpdateResponse,
    Error,
    { registrationId: string; data: RegistrationStatusUpdate }
  >({
    mutationFn: async ({ registrationId, data }) => {
      const response = await apiClient.updateRegistrationStatus(
        registrationId,
        data
      );
      return response as RegistrationStatusUpdateResponse;
    },
    onSuccess: (data, variables) => {
      const eventId = data.registration.eventId;

      // Invalidate all registration lists for this event
      queryClient.invalidateQueries({
        queryKey: registrationKeys.lists(),
        predicate: (query) => {
          const params = query.queryKey[2] as GetRegistrationsParams | undefined;
          return params?.eventId === eventId;
        },
      });

      // Update the specific registration in cache
      queryClient.setQueryData(
        registrationKeys.detail(variables.registrationId),
        { registration: data.registration }
      );
    },
  });
}

/**
 * Hook to export registrations to CSV
 */
export function useExportRegistrations() {
  return useMutation<Blob, Error, { eventId: string; status?: RegistrationStatus }>({
    mutationFn: async ({ eventId, status }) => {
      const blob = await apiClient.exportRegistrations(eventId, status);
      return blob;
    },
    onSuccess: (blob, { eventId, status }) => {
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `registrations-${eventId}${status ? `-${status}` : ''}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
