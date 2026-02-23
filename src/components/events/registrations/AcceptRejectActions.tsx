"use client";

/**
 * Accept/Reject Actions Component
 *
 * Action buttons for VPs and Co-Presidents to accept or reject applications
 */

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateRegistrationStatus } from "@/hooks/use-registrations";
import { ConfirmActionDialog } from "./ConfirmActionDialog";

interface AcceptRejectActionsProps {
  registrationId: string;
  applicantName: string;
  applicantEmail: string;
  eventTitle: string;
  onSuccess?: (rsvpLink?: string) => void;
  variant?: "default" | "compact";
}

export function AcceptRejectActions({
  registrationId,
  applicantName,
  applicantEmail,
  eventTitle,
  onSuccess,
  variant = "default",
}: Readonly<AcceptRejectActionsProps>) {
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const updateStatus = useUpdateRegistrationStatus();

  const handleAccept = async () => {
    try {
      const result = await updateStatus.mutateAsync({
        registrationId,
        data: { status: "accepted" },
      });
      setShowAcceptDialog(false);
      onSuccess?.(result.registration.rsvpLink);
    } catch (error) {
      // Error will be handled by React Query
      console.error("Failed to accept registration:", error);
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync({
        registrationId,
        data: { status: "rejected" },
      });
      setShowRejectDialog(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to reject registration:", error);
    }
  };

  const buttonSize = variant === "compact" ? "sm" : "default";

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setShowAcceptDialog(true)}
          disabled={updateStatus.isPending}
          size={buttonSize}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
        <Button
          onClick={() => setShowRejectDialog(true)}
          disabled={updateStatus.isPending}
          variant="destructive"
          size={buttonSize}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>

      {/* Accept Confirmation Dialog */}
      <ConfirmActionDialog
        open={showAcceptDialog}
        onOpenChange={setShowAcceptDialog}
        actionType="accept"
        applicantName={applicantName}
        applicantEmail={applicantEmail}
        eventTitle={eventTitle}
        onConfirm={handleAccept}
        isPending={updateStatus.isPending}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmActionDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        actionType="reject"
        applicantName={applicantName}
        applicantEmail={applicantEmail}
        eventTitle={eventTitle}
        onConfirm={handleReject}
        isPending={updateStatus.isPending}
      />

      {/* Error Display */}
      {updateStatus.isError && (
        <p className="text-sm text-red-600 mt-2">
          {updateStatus.error?.message || "Failed to update status"}
        </p>
      )}
    </>
  );
}
