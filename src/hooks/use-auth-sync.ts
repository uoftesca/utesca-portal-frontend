/**
 * Auth Synchronization Hook
 *
 * Listens to Supabase auth state changes and synchronizes them with React Query cache.
 * This ensures that when Supabase automatically refreshes tokens or signs out,
 * the React Query cache is updated accordingly.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';
import { authKeys } from './use-auth';

/**
 * Hook to sync Supabase auth events with React Query cache
 *
 * Should be called once in the QueryProvider to set up the global auth listener.
 *
 * Handles the following events:
 * - SIGNED_OUT: Clears all cached data
 * - TOKEN_REFRESHED: Invalidates user query to refetch with new token
 * - SIGNED_IN: Invalidates user query to fetch user data
 */
export function useAuthSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    // Subscribe to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      console.log('[Auth Sync] Auth state changed:', event);

      switch (event) {
        case 'SIGNED_OUT':
          // Clear all cached data when user signs out
          console.log('[Auth Sync] Clearing all cached data');
          queryClient.clear();
          break;

        case 'TOKEN_REFRESHED':
          // Invalidate user query when token is refreshed
          // This ensures we fetch fresh user data with the new token
          console.log('[Auth Sync] Token refreshed, invalidating user query');
          queryClient.invalidateQueries({ queryKey: authKeys.user });
          break;

        case 'SIGNED_IN':
          // Invalidate user query when user signs in
          console.log('[Auth Sync] User signed in, invalidating user query');
          queryClient.invalidateQueries({ queryKey: authKeys.user });
          break;

        case 'USER_UPDATED':
          // User metadata was updated, refetch user data
          console.log('[Auth Sync] User updated, invalidating user query');
          queryClient.invalidateQueries({ queryKey: authKeys.user });
          break;

        default:
          // Log other events for debugging
          console.log('[Auth Sync] Unhandled event:', event);
      }
    });

    // Cleanup: Unsubscribe when component unmounts
    return () => {
      console.log('[Auth Sync] Cleaning up auth state listener');
      subscription.unsubscribe();
    };
  }, [queryClient]);
}
