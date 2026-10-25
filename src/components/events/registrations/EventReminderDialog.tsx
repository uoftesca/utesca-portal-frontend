'use client';

import { Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  confirmedCount: number;
  onConfirm: () => void;
  isPending: boolean;
}

export function EventReminderDialog({
  open,
  onOpenChange,
  eventTitle,
  confirmedCount,
  onConfirm,
  isPending,
}: Readonly<EventReminderDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <DialogTitle>Notify confirmed registrants?</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            This will email a reminder for {eventTitle} to every unique confirmed
            registrant. The backend currently reports {confirmedCount} confirmed
            registration{confirmedCount === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted p-4 text-sm">
          <p className="font-medium">Reminder</p>
          <p><strong>Event:</strong> {eventTitle}</p>
          <p className="mt-2 text-muted-foreground">
            Date, time, and location will be read from the event in Supabase.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending || confirmedCount === 0}>
            <Mail className="mr-2 h-4 w-4" />
            {isPending ? 'Queuing...' : 'Send Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
