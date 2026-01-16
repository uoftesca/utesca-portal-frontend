/**
 * Auth Synchronization Hook
 *
 * Listens to Supabase auth state changes and synchronizes them with React Query cache.
 * This ensures that when Supabase automatically refreshes tokens or signs out,
 * the React Query cache is updated accordingly.
 */

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase';
import { authKeys } from './use-auth';
import type { AuthChangeEvent, Subscription } from '@supabase/supabase-js';

// Global singleton subscription to prevent duplicate listeners
let globalSubscription: Subscription | null = null;
let subscriberCount = 0;

/**
 * Hook to sync Supabase auth events with React Query cache
 *
 * Should be called once in the QueryProvider to set up the global auth listener.
 * Uses a singleton subscription pattern to prevent duplicate event handlers.
 *
 * Handles the following events:
 * - INITIAL_SESSION: Session recovered from cookies on page load
 * - SIGNED_IN: User signed in (invalidates user query to fetch user data)
 * - SIGNED_OUT: User signed out (clears all cached data)
 * - TOKEN_REFRESHED: Token refreshed silently (no action needed)
 * - USER_UPDATED: User metadata updated (invalidates user query)
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);

  // Keep ref up to date
  useEffect(() => {
    queryClientRef.current = queryClient;
  }, [queryClient]);

  useEffect(() => {
    subscriberCount++;
    console.log(`[Auth Sync] Subscriber count: ${subscriberCount}`);

    // Only create subscription if it doesn't exist
    if (globalSubscription) {
      console.log('[Auth Sync] Reusing existing global subscription');
    } else {
      console.log('[Auth Sync] Creating global auth state listener');
      const supabase = getSupabaseClient();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
        console.log('[Auth Sync] Auth state changed:', event);

        // Use the latest queryClient from ref
        const qc = queryClientRef.current;

        switch (event) {
          case 'INITIAL_SESSION':
            // Session was recovered from cookies (e.g., page refresh or returning to tab)
            // Invalidate user query to sync React Query with the recovered session
            console.log('[Auth Sync] Initial session recovered, invalidating user query');
            qc.invalidateQueries({ queryKey: authKeys.user });
            break;

          case 'SIGNED_IN':
            // Invalidate user query when user signs in
            console.log('[Auth Sync] User signed in, invalidating user query');
            qc.invalidateQueries({ queryKey: authKeys.user });
            break;

          case 'SIGNED_OUT':
            // Clear all cached data when user signs out
            console.log('[Auth Sync] Clearing all cached data');
            qc.clear();
            break;

          case 'TOKEN_REFRESHED':
            // Token was refreshed in the background
            // No action needed - next API call will get the new token via getSession()
            console.log('[Auth Sync] Token refreshed silently');
            break;

          case 'USER_UPDATED':
            // User metadata was updated, refetch user data
            console.log('[Auth Sync] User updated, invalidating user query');
            qc.invalidateQueries({ queryKey: authKeys.user });
            break;

          default:
            // Log other events for debugging
            console.log('[Auth Sync] Unhandled event:', event);
        }
      });

      globalSubscription = subscription;
    }

    // Cleanup: Only unsubscribe when the last subscriber unmounts
    return () => {
      subscriberCount--;
      console.log(`[Auth Sync] Subscriber count: ${subscriberCount}`);

      if (subscriberCount === 0 && globalSubscription) {
        console.log('[Auth Sync] Last subscriber unmounted, cleaning up global listener');
        globalSubscription.unsubscribe();
        globalSubscription = null;
      }
    };
  }, []); // Empty deps - only run once per component instance
}
