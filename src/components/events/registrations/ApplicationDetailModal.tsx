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
import { formatInTorontoTime } from '@/lib/timezone';
import { formatFieldValue, getFieldValueMetadata, extractName, extractEmail } from '@/lib/schema-utils';
import { formatFileSize } from '@/lib/utils';
import type { UserRole } from '@/types/user';
import type { RegistrationFormSchema } from '@/types/registration';

interface ApplicationDetailModalProps {
  registrationId: string | null;
  schema?: RegistrationFormSchema | null;
  eventTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole?: UserRole;
}

export function ApplicationDetailModal({
  registrationId,
  schema,
  eventTitle,
  open,
  onOpenChange,
  userRole,
}: Readonly<ApplicationDetailModalProps>) {
  const { data, isLoading, error, refetch } = useRegistration(registrationId);

  const registration = data?.registration;
  const canEdit = userRole === 'vp' || userRole === 'co_president';
  const showActions = canEdit && registration?.status === 'submitted';
  const showRsvpLink = registration?.status === 'accepted';

  // Extract applicant data for confirmation dialogs
  const applicantName = registration ? extractName(registration.formData) : '';
  const applicantEmail = registration ? extractEmail(registration.formData) : '';

  // Handle status update success
  const handleStatusUpdateSuccess = async () => {
    await refetch();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            View complete registration information and take action.
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
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Submitted @ {formatInTorontoTime(registration.submittedAt, 'MMM d, yyyy h:mm a zzz')}
              </p>
              {registration.reviewedAt && registration.reviewedBy && (
                <p className="text-sm text-muted-foreground">
                  Reviewed @ {formatInTorontoTime(registration.reviewedAt, 'MMM d, yyyy h:mm a zzz')}
                </p>
              )}
              <div className="flex w-full items-start justify-between">
                {registration.confirmedAt && (
                  <p className="text-sm text-muted-foreground">
                    Confirmed @ {formatInTorontoTime(registration.confirmedAt, 'MMM d, yyyy h:mm a zzz')}
                  </p>
                )}
                <RegistrationStatusBadge status={registration.status} />
              </div>
            </div>

            <Separator />

            {/* Form Data */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Form Responses</h3>
              {!schema ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    Form schema not available. Cannot display responses.
                  </AlertDescription>
                </Alert>
              ) : (
                schema.fields.map((field) => {
                  const value = registration.formData[field.id];
                  const metadata = getFieldValueMetadata(value);

                  let displayValue: string;
                  if (metadata.isFile) {
                    displayValue = (value as { fileName: string }).fileName;
                  } else if (
                    // For optional checkboxes, treat empty arrays or false as empty (show "—")
                    field.type === 'checkbox' &&
                    !field.required &&
                    (value === false || (Array.isArray(value) && value.length === 0))
                  ) {
                    displayValue = '—';
                  } else {
                    displayValue = formatFieldValue(value); // Returns "—" for null/undefined
                  }

                  return (
                    <div key={field.id} className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {field.label}
                        {!field.required && (
                          <span className="text-xs ml-1 text-muted-foreground">
                            (optional)
                          </span>
                        )}
                      </p>
                      {metadata.isLongText ? (
                        <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                          {displayValue}
                        </div>
                      ) : (
                        <p className="text-sm">{displayValue}</p>
                      )}
                    </div>
                  );
                })
              )}
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
                <RsvpLinkDisplay id={registration.id} />
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {showActions && registration && (
            <AcceptRejectActions
              registrationId={registration.id}
              applicantName={applicantName}
              applicantEmail={applicantEmail}
              eventTitle={eventTitle || 'this event'}
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
