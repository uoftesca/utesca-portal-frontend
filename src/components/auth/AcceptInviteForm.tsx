/**
 * Accept Invite Form Component
 *
 * Handles the form for new users to set their password and preferred name
 * after clicking the invite link.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface UserMetadata {
  firstName: string;
  lastName: string;
  role: string;
  displayRole: string;
}

// Raw metadata from Supabase may be in snake_case or camelCase
interface RawUserMetadata {
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  role?: string;
  display_role?: string;
  displayRole?: string;
}

export default function AcceptInviteForm() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredName, setPreferredName] = useState('');

  // Verify invite token and fetch user metadata
  useEffect(() => {
    async function verifyInvite() {
      try {
        // Check search params for token_hash (Supabase invite flow)
        const searchParams = new URLSearchParams(globalThis.location.search);
        const tokenHash = searchParams.get('token_hash');
        const typeParam = searchParams.get('type');

        // If we have a token_hash, verify it with Supabase
        if (tokenHash && typeParam === 'invite') {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'invite',
          });

          if (verifyError) {
            setError('Invalid or expired invite link');
            return;
          }

          if (data.session && data.user) {
            // Extract user metadata from session
            // Note: Supabase metadata may still be in snake_case, so we need to handle both
            const rawMetadata = data.user.user_metadata as RawUserMetadata;
            const metadata: UserMetadata = {
              firstName: rawMetadata.first_name || rawMetadata.firstName || '',
              lastName: rawMetadata.last_name || rawMetadata.lastName || '',
              role: rawMetadata.role || '',
              displayRole: rawMetadata.display_role || rawMetadata.displayRole || '',
            };
            if (!metadata.firstName || !metadata.lastName) {
              console.error('Missing metadata:', rawMetadata);
              setError('Invalid user metadata - please contact co-presidents');
              return;
            }

            setUserMetadata(metadata);
            // Clean up URL
            globalThis.history.replaceState(
              {},
              document.title,
              globalThis.location.pathname
            );
            return;
          }
        }

        // If no token in URL, check if we already have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          console.error('No valid session found');
          setError('Invalid or expired invite link');
          return;
        }

        // Extract user metadata from session
        // Note: Supabase metadata may still be in snake_case, so we need to handle both
        const rawMetadata = session.user.user_metadata as RawUserMetadata;
        const metadata: UserMetadata = {
          firstName: rawMetadata.first_name || rawMetadata.firstName || '',
          lastName: rawMetadata.last_name || rawMetadata.lastName || '',
          role: rawMetadata.role || '',
          displayRole: rawMetadata.display_role || rawMetadata.displayRole || '',
        };
        if (!metadata.firstName || !metadata.lastName) {
          console.error('Missing metadata in existing session:', rawMetadata);
          setError('Invalid user metadata. Please contact co-presidents');
          return;
        }

        setUserMetadata(metadata);
      } catch (err) {
        console.error('Error verifying invite:', err);
        setError('Failed to verify invite');
      }
    }

    verifyInvite();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Get current session for auth token and user email
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token || !session?.user?.email) {
        throw new Error('No active session found');
      }

      const userEmail = session.user.email;

      // Call backend to complete onboarding (sets password + creates user record)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/complete-onboarding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            password: password,
            preferredName: preferredName.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to complete onboarding');
      }

      // Sign out the temporary invite session
      await supabase.auth.signOut();

      // Sign in with the new password to get a fresh session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: password,
      });

      if (signInError) {
        throw new Error('Account created but failed to sign in. Please try signing in manually.');
      }

      // Redirect to dashboard
      router.push('/');
    } catch (err: unknown) {
      console.error('Error setting up account:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up account');
    } finally {
      setLoading(false);
    }
  };

  if (error && !userMetadata) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">
            Please contact the co-presidents for a new invite link.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  if (!userMetadata) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Display user info */}
      <Card className="mb-6 bg-primary/5 border-primary/20">
        <CardContent className="space-y-1">
          <p className="text-sm">
            <strong className="font-medium">Name:</strong>{' '}
            {userMetadata.firstName} {userMetadata.lastName}
          </p>
          <p className="text-sm">
            <strong className="font-medium">Role:</strong>{' '}
            {userMetadata.displayRole}
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preferred Name (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="preferredName">
            Preferred Name{' '}
            <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="preferredName"
            type="text"
            value={preferredName}
            onChange={(e) => setPreferredName(e.target.value)}
            placeholder="How you'd like to be called"
          />
          <p className="text-xs text-muted-foreground">
            If different from {userMetadata.firstName}
          </p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
          />
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            Confirm Password <span className="text-destructive">*</span>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter your password"
          />
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Setting up account...' : 'Complete Setup'}
        </Button>
      </form>
    </div>
  );
}
