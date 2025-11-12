/**
 * React Query hooks for users and team management
 *
 * Provides query and mutation hooks for fetching, creating, updating, and deleting users
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  User,
  UserListResponse,
  DepartmentListResponse,
  YearsResponse,
  InviteUserRequest,
  UpdateUserRequest,
  GetDepartmentsParams,
} from '@/types/team';
import type { GetUsersParams } from '@/types/user';

/**
 * Query key factory for users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: GetUsersParams) =>
    [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Query key factory for departments
 */
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (filters?: GetDepartmentsParams) =>
    [...departmentKeys.lists(), filters] as const,
  years: () => [...departmentKeys.all, 'years'] as const,
};

/**
 * Hook to fetch users list with optional filters
 */
export function useUsers(params?: GetUsersParams) {
  return useQuery<UserListResponse, Error>({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getUsers(params);
      return response as UserListResponse;
    },
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(userId: string | null) {
  return useQuery<User, Error>({
    queryKey: userKeys.detail(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.getUserById(userId);
      return response as User;
    },
    enabled: !!userId, // Only run query if userId is provided
  });
}

/**
 * Hook to fetch departments list
 */
export function useDepartments(params?: GetDepartmentsParams) {
  return useQuery<DepartmentListResponse, Error>({
    queryKey: departmentKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.getDepartments(params);
      return response as DepartmentListResponse;
    },
  });
}

/**
 * Hook to fetch available years
 */
export function useAvailableYears() {
  return useQuery<YearsResponse, Error>({
    queryKey: departmentKeys.years(),
    queryFn: async () => {
      const response = await apiClient.getAvailableYears();
      return response as YearsResponse;
    },
  });
}

/**
 * Hook to invite/onboard a new user
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, InviteUserRequest>({
    mutationFn: async (data: InviteUserRequest) => {
      return await apiClient.inviteUser(data);
    },
    onSuccess: () => {
      // Invalidate all users queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

/**
 * Hook to update an existing user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: string; data: UpdateUserRequest }>({
    mutationFn: async ({ userId, data }) => {
      const response = await apiClient.updateUser(userId, data);
      return response as User;
    },
    onSuccess: (data) => {
      // Invalidate all users queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Also update the specific user in cache
      queryClient.setQueryData(userKeys.detail(data.id), data);
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await apiClient.deleteUser(userId);
    },
    onSuccess: (_, userId) => {
      // Invalidate all users queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Remove the specific user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}

