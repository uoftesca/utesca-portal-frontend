/**
 * React Query hooks for authentication
 *
 * Provides hooks for managing user authentication state and sign out
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { createClient } from '@/lib/supabase';
import type { User } from '@/types/team';

/**
 * Query key factory for auth
 */
export const authKeys = {
  user: ['auth', 'user'] as const,
};

/**
 * Hook to get the current authenticated user's full profile
 *
 * Uses React Query to cache the user profile and automatically refetch
 * when the window regains focus.
 *
 * @returns Query result with user profile, loading state, and error
 */
export function useAuth() {
  const query = useQuery<User | null, Error>({
    queryKey: authKeys.user,
    queryFn: async () => {
      try {
        const response = await apiClient.getCurrentUser();
        return response as User;
      } catch {
        // If user is not authenticated, return null instead of throwing
        return null;
      }
    },
    staleTime: 60 * 1000, // 1 minute (auth changes less frequently than other data)
    retry: 1, // Only retry once for auth failures
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isAuthenticated: !!query.data,
    refetch: query.refetch,
  };
}

/**
 * Hook to sign out the current user
 *
 * Signs out from Supabase auth, invalidates the auth cache,
 * and redirects to the sign-in page.
 *
 * @returns Mutation object with mutate function and loading state
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const supabase = createClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate auth cache
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      // Clear all cached data
      queryClient.clear();
      // Redirect to sign-in page
      router.push('/sign-in');
      router.refresh();
    },
  });
}
