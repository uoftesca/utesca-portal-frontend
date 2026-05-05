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
  actionType: 'accept' | 'reject' | 'waitlist';
  applicantName: string;
  applicantEmail: string;
  eventTitle: string;
  onConfirm: () => void | Promise<void>;
  isPending: boolean;
}

const ACTION_CONFIG = {
  accept: {
    title: 'Accept Application?',
    confirmButtonText: 'Accept Application',
    loadingText: 'Accepting...',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    buttonVariant: 'default' as const,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  waitlist: {
    title: 'Waitlist Application?',
    confirmButtonText: 'Waitlist Application',
    loadingText: 'Waitlisting...',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    buttonVariant: 'default' as const,
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
  },
  reject: {
    title: 'Reject Application?',
    confirmButtonText: 'Reject Application',
    loadingText: 'Rejecting...',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    buttonVariant: 'destructive' as const,
    buttonClass: '',
  },
};

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
  const config = ACTION_CONFIG[actionType];

  const descriptionByAction: Record<typeof actionType, string> = {
    accept: `You are about to accept ${applicantName}'s application for ${eventTitle}. An email will be automatically sent to ${applicantEmail} with an RSVP link to confirm their attendance.`,
    waitlist: `You are about to waitlist ${applicantName}'s application for ${eventTitle}. The applicant will not be notified; this is an internal action only.`,
    reject: `You are about to reject ${applicantName}'s application for ${eventTitle}. An email will be automatically sent to ${applicantEmail}. This action cannot be undone.`,
  };
  const description = descriptionByAction[actionType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${config.iconBg}`}
            >
              <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription className="pt-3">{description}</DialogDescription>
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
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={isPending}
            className={config.buttonClass}
          >
            {isPending ? config.loadingText : config.confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
