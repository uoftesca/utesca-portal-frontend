/**
 * Supabase client configuration for UTESCA Portal
 *
 * This module provides Supabase client instances for authentication
 * and database operations in the Next.js app router.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for client-side operations
 *
 * Usage in client components:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase'
 *
 * const supabase = createClient()
 * const { data, error } = await supabase.auth.getUser()
 * ```
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
