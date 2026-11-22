'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatInTorontoTime } from '@/lib/timezone';

interface EventReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  /** ISO 8601 UTC event start, used to preview the reminder body. */
  eventDateTime?: string;
  eventLocation?: string | null;
  confirmedCount: number;
  onConfirm: (emailBody: string) => void;
  isPending: boolean;
  /**
   * Whether the email body can be edited. Leave false until the reminder
   * endpoint accepts a custom body; otherwise edits would be silently ignored.
   */
  bodyEditable?: boolean;
}

/**
 * Mirrors the plain-text body built by the backend's
 * `build_event_reminder_email` (src/core/email/templates.py).
 */
function buildDefaultReminderBody(
  eventTitle: string,
  eventDateTime?: string,
  eventLocation?: string | null
): string {
  // Matches the backend's format_datetime_toronto (zero-padded day).
  const dateTime = eventDateTime
    ? formatInTorontoTime(eventDateTime, "EEEE, MMMM dd, yyyy 'at' h:mm a zzz")
    : 'TBA';
  const location = eventLocation || 'TBA';
  return `Reminder

**Event:** ${eventTitle}
**Date & Time:** ${dateTime}
**Location:** ${location}
`;
}

export function EventReminderDialog({
  open,
  onOpenChange,
  eventTitle,
  eventDateTime,
  eventLocation,
  confirmedCount,
  onConfirm,
  isPending,
  bodyEditable = false,
}: Readonly<EventReminderDialogProps>) {
  const defaultBody = buildDefaultReminderBody(eventTitle, eventDateTime, eventLocation);

  // null = untouched, so the prefill tracks event data that loads late.
  const [editedBody, setEditedBody] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setEditedBody(null);
  }

  const emailBody = editedBody ?? defaultBody;

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

        <div className="grid gap-2">
          <Label htmlFor="reminder-email-body">Email body</Label>
          <Textarea
            id="reminder-email-body"
            value={emailBody}
            onChange={(e) => setEditedBody(e.target.value)}
            readOnly={!bodyEditable}
            disabled={isPending}
            rows={6}
            className="max-h-64"
            aria-describedby={bodyEditable ? undefined : 'reminder-email-body-note'}
          />
          {!bodyEditable && (
            <p id="reminder-email-body-note" className="text-xs text-muted-foreground">
              Preview of the standard reminder. Custom text isn&apos;t supported by the
              reminder service yet, so this body can&apos;t be edited.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(emailBody)} disabled={isPending || confirmedCount === 0}>
            <Mail className="mr-2 h-4 w-4" />
            {isPending ? 'Queuing...' : 'Send Reminder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
