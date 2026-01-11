'use client';

/**
 * React Query Provider Component
 *
 * Wraps the app with QueryClientProvider for React Query functionality
 * and sets up auth state synchronization
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthSync } from '@/hooks/use-auth-sync';

export function QueryProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 seconds - data considered fresh for 30s
            gcTime: 5 * 60 * 1000, // 5 minutes - cached data kept for 5min after unmount
            refetchOnWindowFocus: false, // Prevent aggressive refetches on window focus
            retry: 1, // Retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSyncWrapper>{children}</AuthSyncWrapper>
    </QueryClientProvider>
  );
}

/**
 * Wrapper component to use auth sync hook
 * (hooks can't be called directly in QueryProvider since it's not a child of QueryClientProvider)
 */
function AuthSyncWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Set up auth state synchronization
  useAuthSync();
  return <>{children}</>;
}

