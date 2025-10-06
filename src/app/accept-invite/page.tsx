/**
 * Accept Invite Page
 *
 * This page handles the invite acceptance flow for new UTESCA executive members.
 * Users land here after clicking the invite link in their email.
 *
 * Flow:
 * 1. Extract token_hash and type from URL params
 * 2. Verify the invite token with Supabase (client-side)
 * 3. Display form to set password and optional preferred name
 * 4. Call backend /complete-onboarding endpoint which:
 *    - Updates password in Supabase Auth
 *    - Creates user record in users table
 * 5. Redirect to dashboard
 */

'use client';

import { Suspense } from 'react';
import AcceptInviteForm from '@/components/auth/AcceptInviteForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">
              Welcome to UTESCA
            </CardTitle>
            <CardDescription>
              Complete your account setup to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<LoadingState />}>
              <AcceptInviteForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
