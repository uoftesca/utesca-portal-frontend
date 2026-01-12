/**
 * Supabase client configuration for UTESCA Portal
 *
 * Provides a singleton Supabase client for client-side operations.
 * Using a singleton ensures only one client instance exists, preventing
 * race conditions during token refresh operations.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Singleton instance
let client: SupabaseClient | undefined

/**
 * Get the singleton Supabase client for client-side operations
 *
 * Creates a single shared instance to prevent race conditions during
 * token refresh. All client-side code should use this same instance.
 *
 * Token refresh is handled automatically by Supabase's internal mechanisms.
 *
 * Usage in client components:
 * ```tsx
 * 'use client'
 * import { getSupabaseClient } from '@/lib/supabase'
 *
 * const supabase = getSupabaseClient()
 * const { data, error } = await supabase.auth.getUser()
 * ```
 */
export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    console.log('[Supabase] Creating singleton client instance');
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Keep backward compatibility alias
export const createClient = getSupabaseClient
