'use client';

/**
 * Delete Member Dialog Component
 *
 * Confirmation dialog for deleting team members
 */

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteUser } from '@/hooks/use-users';
import type { User } from '@/types/team';

interface DeleteMemberDialogProps {
  user: User;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function DeleteMemberDialog({
  user,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  children,
}: Readonly<DeleteMemberDialogProps>) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  const deleteUserMutation = useDeleteUser();

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(user.id);

      setOpen(false);
      onSuccess?.();
    } catch {
      // Error is handled by React Query and displayed below
    }
  };

  const displayName = user.preferredName
    ? `${user.firstName} (${user.preferredName}) ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Team Member</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            Are you sure you want to delete <span className="font-semibold text-foreground">{displayName}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {deleteUserMutation.isError && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {deleteUserMutation.error instanceof Error
                ? deleteUserMutation.error.message
                : 'Failed to delete user'}
            </div>
          )}

          <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium">{user.displayRole}</span>
            </div>
          </div>

          <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-md">
            <p className="text-sm text-destructive font-medium">
              This will permanently delete the user&apos;s account and remove all their data.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteUserMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete Member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
