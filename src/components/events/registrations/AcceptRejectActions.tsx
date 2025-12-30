'use client';

/**
 * Accept/Reject Actions Component
 *
 * Action buttons for VPs and Co-Presidents to accept or reject applications
 */

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUpdateRegistrationStatus } from '@/hooks/use-registrations';

interface AcceptRejectActionsProps {
  registrationId: string;
  onSuccess?: (rsvpLink?: string) => void;
  variant?: 'default' | 'compact';
}

export function AcceptRejectActions({
  registrationId,
  onSuccess,
  variant = 'default',
}: Readonly<AcceptRejectActionsProps>) {
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const updateStatus = useUpdateRegistrationStatus();

  const handleAccept = async () => {
    try {
      const result = await updateStatus.mutateAsync({
        registrationId,
        data: { status: 'accepted' },
      });
      onSuccess?.(result.rsvpLink);
    } catch (error) {
      // Error will be handled by React Query
      console.error('Failed to accept registration:', error);
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({
        registrationId,
        data: { status: 'rejected' },
      });
      setShowRejectDialog(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to reject registration:', error);
    }
  };

  const buttonSize = variant === 'compact' ? 'sm' : 'default';

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAccept}
          disabled={updateStatus.isPending}
          size={buttonSize}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={updateStatus.isPending}
          variant="destructive"
          size={buttonSize}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application?</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={updateStatus.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending ? 'Rejecting...' : 'Reject Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {updateStatus.isError && (
        <p className="text-sm text-red-600 mt-2">
          {updateStatus.error?.message || 'Failed to update status'}
        </p>
      )}
    </>
  );
}
