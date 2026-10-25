"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { RegistrationEditForm } from "@/components/events/registrations/RegistrationEditForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useEvent } from "@/hooks/use-events";
import { useRegistration } from "@/hooks/use-registrations";

export default function EditRegistrationPage() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useAuth();
  const registrationQuery = useRegistration(registrationId);
  const registration = registrationQuery.data?.registration;
  const eventQuery = useEvent(registration?.eventId ?? null);

  useEffect(() => {
    if (!isLoadingUser && user && user.role === "director") {
      router.replace("/");
    }
  }, [isLoadingUser, router, user]);

  const isLoading =
    isLoadingUser || registrationQuery.isLoading || (!!registration && eventQuery.isLoading);
  const error = registrationQuery.error || eventQuery.error;

  if (isLoading || user?.role === "director") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  if (error || !registration || !eventQuery.data?.registrationFormSchema) {
    return (
      <main className="container mx-auto max-w-3xl px-6 py-16">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || "This application does not have an editable form."}
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto flex justify-center px-6 py-12 md:py-16">
        <RegistrationEditForm
          registrationId={registration.id}
          eventId={registration.eventId}
          eventTitle={eventQuery.data.title}
          schema={eventQuery.data.registrationFormSchema}
          initialValues={registration.formData}
        />
      </div>
    </main>
  );
}
