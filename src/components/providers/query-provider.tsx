'use client';

/**
 * React Query Provider Component
 *
 * Wraps the app with QueryClientProvider for React Query functionality
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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
            refetchOnWindowFocus: true, // Refetch when window regains focus
            retry: 1, // Retry failed requests once
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

