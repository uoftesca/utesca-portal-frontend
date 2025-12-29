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
  const [copySuccess, setCopySuccess] = useState(false);
  const updateStatus = useUpdateRegistrationStatus();

  const canEdit = userRole === 'vp' || userRole === 'co_president';
  const showAcceptReject = canEdit && registration.status === 'submitted';
  const showCopyRsvp =
    registration.status === 'accepted' && registration.rsvpToken;

  const handleCopyRsvp = async () => {
    const rsvpUrl = `https://utesca.ca/rsvp/${registration.rsvpToken}`;
    try {
      await navigator.clipboard.writeText(rsvpUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setIsOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy RSVP link:', error);
      alert('Failed to copy RSVP link');
    }
  };

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
