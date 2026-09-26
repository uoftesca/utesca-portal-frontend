'use client';

/**
 * Scan Tickets Dialog Component
 *
 * Dialog for VPs and Co-presidents to scan tickets for event check-in
 */

import { useState } from 'react';
import { ScanIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TicketScanner } from '@/components/events/TicketScanner';

export function ScanTicketsDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <ScanIcon className="h-4 w-4" />
          Scan Event Tickets
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Event Tickets</DialogTitle>
          <DialogDescription>
            Scan an event ticket QR code to check-in an attendee
          </DialogDescription>
        </DialogHeader>
        <TicketScanner></TicketScanner>
      </DialogContent>
    </Dialog>
  );
}
