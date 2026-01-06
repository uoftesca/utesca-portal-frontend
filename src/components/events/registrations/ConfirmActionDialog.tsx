'use client';

/**
 * Confirm Action Dialog Component
 *
 * Reusable confirmation dialog for accept/reject actions in application review system.
 * Prevents accidental status changes by requiring explicit confirmation.
 */

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'accept' | 'reject';
  applicantName: string;
  applicantEmail: string;
  eventTitle: string;
  onConfirm: () => void | Promise<void>;
  isPending: boolean;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  actionType,
  applicantName,
  applicantEmail,
  eventTitle,
  onConfirm,
  isPending,
}: Readonly<ConfirmActionDialogProps>) {
  const isAccept = actionType === 'accept';

  const title = isAccept ? 'Accept Application?' : 'Reject Application?';

  const description = isAccept
    ? `You are about to accept ${applicantName}'s application for ${eventTitle}. An RSVP link will be generated. You will need to manually email it to ${applicantName}.`
    : `You are about to reject ${applicantName}'s application for ${eventTitle}. This action cannot be undone.`;

  const confirmButtonText = isAccept ? 'Accept Application' : 'Reject Application';
  const loadingText = isAccept ? 'Accepting...' : 'Rejecting...';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                isAccept ? 'bg-amber-500/10' : 'bg-destructive/10'
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 ${
                  isAccept ? 'text-amber-500' : 'text-destructive'
                }`}
              />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Applicant Information */}
        {applicantEmail && (
          <div className="bg-muted p-4 rounded-md">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Applicant Email:</span>
              <span className="font-medium">{applicantEmail}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant={isAccept ? 'default' : 'destructive'}
            onClick={onConfirm}
            disabled={isPending}
            className={isAccept ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {isPending ? loadingText : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
