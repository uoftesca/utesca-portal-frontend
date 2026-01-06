'use client';

/**
 * Application Row Actions Component
 *
 * Three-dot dropdown menu for registration table rows with conditional actions
 * based on status and user permissions
 */

import { useState } from 'react';
import { MoreVertical, ExternalLink, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUpdateRegistrationStatus } from '@/hooks/use-registrations';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import type { Registration } from '@/types/registration';
import type { UserRole } from '@/types/user';

interface ApplicationRowActionsProps {
  registration: Registration;
  userRole?: UserRole;
  onViewDetails: () => void;
  onStatusUpdate: () => void;
}

export function ApplicationRowActions({
  registration,
  userRole,
  onViewDetails,
  onStatusUpdate,
}: Readonly<ApplicationRowActionsProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const updateStatus = useUpdateRegistrationStatus();

  const canEdit = userRole === 'vp' || userRole === 'co_president';
  const showAcceptReject = canEdit && registration.status === 'submitted';
  const showCopyRsvp = registration.status === 'accepted';

  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_URL || 'https://utesca.ca';
  const rsvpUrl = `${baseUrl}/rsvp/${registration.id}`;

  const { copied: copySuccess, copy } = useCopyToClipboard({
    timeout: 1500,
    onSuccess: () => {
      // Close dropdown after successful copy
      setTimeout(() => setIsOpen(false), 1500);
    },
    onError: () => {
      alert('Failed to copy RSVP link');
    },
  });

  const handleCopyRsvp = () => copy(rsvpUrl);

  const handleAccept = async () => {
    try {
      await updateStatus.mutateAsync({
        registrationId: registration.id,
        data: { status: 'accepted' },
      });
      onStatusUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to accept application:', error);
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({
        registrationId: registration.id,
        data: { status: 'rejected' },
      });
      onStatusUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onViewDetails}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View Full Details
        </DropdownMenuItem>

        {showCopyRsvp && (
          <DropdownMenuItem onClick={handleCopyRsvp} disabled={copySuccess}>
            <Copy className="mr-2 h-4 w-4" />
            {copySuccess ? 'Copied!' : 'Copy RSVP Link'}
          </DropdownMenuItem>
        )}

        {showAcceptReject && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleAccept}
              disabled={updateStatus.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleReject}
              disabled={updateStatus.isPending}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
