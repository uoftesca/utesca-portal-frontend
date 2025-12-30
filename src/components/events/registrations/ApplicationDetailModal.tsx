'use client';

/**
 * Application Detail Modal Component
 *
 * Full-screen detail view of a registration with all form responses and files
 */

import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegistration } from '@/hooks/use-registrations';
import { AcceptRejectActions } from './AcceptRejectActions';
import { RsvpLinkDisplay } from './RsvpLinkDisplay';
import { RegistrationStatusBadge } from './RegistrationStatusBadge';
import { getFieldLabel } from '@/lib/schema-utils';
import { formatInTorontoTime } from '@/lib/timezone';
import type { UserRole } from '@/types/user';
import type { RegistrationFormSchema } from '@/types/registration';

interface ApplicationDetailModalProps {
  registrationId: string | null;
  schema?: RegistrationFormSchema | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: UserRole;
}

export function ApplicationDetailModal({
  registrationId,
  schema,
  open,
  onOpenChange,
  userRole,
}: Readonly<ApplicationDetailModalProps>) {
  const { data, isLoading, error, refetch } = useRegistration(registrationId);

  const registration = data?.registration;
  const canEdit = userRole === 'vp' || userRole === 'co_president';
  const showActions = canEdit && registration?.status === 'submitted';
  const showRsvpLink = registration?.status === 'accepted' && registration.rsvpToken;

  // Check if value is a file object (has fileUrl and fileName)
  const isFileObject = (value: unknown): boolean => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'fileUrl' in value &&
      'fileName' in value
    );
  };

  // Format field value for display
  const formatFieldValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'string' && value.length > 100) {
      // Long text field - preserve line breaks
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Handle status update success
  const handleStatusUpdateSuccess = async () => {
    await refetch();
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            View complete registration information and take action
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error.message || 'Failed to load registration details'}
            </AlertDescription>
          </Alert>
        )}

        {registration && (
          <div className="space-y-6">
            {/* Status and Metadata */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <RegistrationStatusBadge status={registration.status} />
                <p className="text-sm text-muted-foreground">
                  Submitted @ {formatInTorontoTime(registration.submittedAt, 'MMM d, yyyy h:mm a zzz')}
                </p>
                {registration.reviewedAt && registration.reviewedBy && (
                  <p className="text-sm text-muted-foreground">
                    Reviewed @ {formatInTorontoTime(registration.reviewedAt, 'MMM d, yyyy h:mm a zzz')}
                  </p>
                )}
                {registration.confirmedAt && (
                  <p className="text-sm text-muted-foreground">
                    Confirmed @ {formatInTorontoTime(registration.confirmedAt, 'MMM d, yyyy h:mm a zzz')}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Form Data */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Form Responses</h3>
              {Object.entries(registration.formData).map(([key, value]) => {
                const isFile = isFileObject(value);
                const displayValue = isFile
                  ? (value as { fileName: string }).fileName
                  : formatFieldValue(value);
                const isLongText =
                  !isFile && typeof value === 'string' && value.length > 100;

                return (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {getFieldLabel(schema, key)}
                    </p>
                    {isLongText ? (
                      <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                        {displayValue}
                      </div>
                    ) : (
                      <p className="text-sm">{displayValue}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Uploaded Files */}
            {registration.files && registration.files.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Uploaded Files</h3>
                  {registration.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)} • {file.mimeType}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* RSVP Link */}
            {showRsvpLink && (
              <>
                <Separator />
                <RsvpLinkDisplay token={registration.rsvpToken!} />
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {showActions && registration && (
            <AcceptRejectActions
              registrationId={registration.id}
              onSuccess={handleStatusUpdateSuccess}
            />
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
