'use client';

/**
 * Applications Table Component
 *
 * Data table displaying registrations with Name, Email, Applied At, Status, and Actions columns
 * Uses schema-aware utility functions for proper field label extraction
 */

import { FileX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApplicationRowActions } from './ApplicationRowActions';
import { RegistrationStatusBadge } from './RegistrationStatusBadge';
import { extractName, extractEmail } from '@/lib/schema-utils';
import { formatInTorontoTime } from '@/lib/timezone';
import type { Registration } from '@/types/registration';
import type { UserRole } from '@/types/user';

interface ApplicationsTableProps {
  registrations: Registration[];
  isLoading: boolean;
  error: Error | null;
  userRole?: UserRole;
  onViewDetails: (id: string) => void;
  onStatusUpdate: () => void;
}

export function ApplicationsTable({
  registrations,
  isLoading,
  error,
  userRole,
  onViewDetails,
  onStatusUpdate,
}: Readonly<ApplicationsTableProps>) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Applied At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error.message || 'Failed to load registrations'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <FileX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          There are no registrations matching your current filters. Try
          adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  // Table with data
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Name</TableHead>
            <TableHead className="min-w-[200px]">Email</TableHead>
            <TableHead className="min-w-[200px]">Applied At</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration) => {
            const name = extractName(registration.formData);
            const email = extractEmail(registration.formData);
            const appliedAt = formatInTorontoTime(
              registration.submittedAt,
              'MMM d, yyyy h:mm a zzz'
            );

            return (
              <TableRow
                key={registration.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onViewDetails(registration.id)}
              >
                <TableCell className="font-medium">{name}</TableCell>
                <TableCell className="text-muted-foreground">{email}</TableCell>
                <TableCell className="text-sm">{appliedAt}</TableCell>
                <TableCell>
                  <RegistrationStatusBadge status={registration.status} />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ApplicationRowActions
                    registration={registration}
                    userRole={userRole}
                    onViewDetails={() => onViewDetails(registration.id)}
                    onStatusUpdate={onStatusUpdate}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
