"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, Loader2, Trash2, Upload } from "lucide-react";

import { apiClient } from "@/lib/api-client";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type {
  FormField,
  FileMeta,
  RegistrationFormSchema,
  RegistrationUpdateResponse,
} from "@/types/registration";

interface RegistrationEditFormProps {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  schema: RegistrationFormSchema;
  initialValues: Record<string, unknown>;
  files: FileMeta[];
}

type FieldErrors = Record<string, string[]>;

function getDefaultValue(field: FormField) {
  return field.type === "checkbox" ? [] : "";
}

function validateField(field: FormField, value: unknown): string[] {
  if (field.type === "file") return [];
  if (field.type === "checkbox") {
    return field.required && (!Array.isArray(value) || value.length === 0)
      ? ["Please select at least one option."]
      : [];
  }

  const errors: string[] = [];
  const text = typeof value === "string" ? value.trim() : "";
  if (field.required && !text) errors.push("This field is required.");
  if (field.validation?.minLength && text.length < field.validation.minLength) {
    errors.push(`Must be at least ${field.validation.minLength} characters.`);
  }
  if (field.validation?.maxLength && text.length > field.validation.maxLength) {
    errors.push(`Must be at most ${field.validation.maxLength} characters.`);
  }
  if (field.validation?.pattern && text) {
    try {
      if (!new RegExp(field.validation.pattern).test(text)) {
        errors.push("Invalid format.");
      }
    } catch {
      // Ignore invalid patterns configured in the event schema.
    }
  }
  return errors;
}

export function RegistrationEditForm({
  registrationId,
  eventId,
  eventTitle,
  schema,
  initialValues,
  files,
}: Readonly<RegistrationEditFormProps>) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      initial[field.id] = initialValues[field.id] ?? getDefaultValue(field);
    });
    return initial;
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notifyApplicant, setNotifyApplicant] = useState(false);
  const [currentFiles, setCurrentFiles] = useState<Record<string, FileMeta>>(() =>
    Object.fromEntries(files.filter((file) => !file.deleted).map((file) => [file.fieldName, file]))
  );
  const [busyFileField, setBusyFileField] = useState<string | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const { startUpload } = useUploadThing("registrationFile");

  const applicationsUrl = `/?event=${eventId}&view=applications`;
  const setValue = (fieldId: string, value: unknown) => {
    setFormValues((current) => ({ ...current, [fieldId]: value }));
    setFieldErrors((current) => ({ ...current, [fieldId]: [] }));
  };

  const deleteHostedFile = async (file: FileMeta) => {
    const fileKey = file.fileUrl.split("/").pop()?.split("?")[0];
    if (!fileKey) throw new Error("Could not determine the hosted file key.");

    const response = await fetch("/api/uploadthing/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileKey }),
    });
    if (!response.ok) throw new Error("Failed to delete the hosted file.");
    await apiClient.deleteRegistrationFile(registrationId, file.id);
  };

  const removeFile = async (fieldId: string) => {
    const file = currentFiles[fieldId];
    if (!file) return;

    setBusyFileField(fieldId);
    setFileErrors((current) => ({ ...current, [fieldId]: "" }));
    try {
      await deleteHostedFile(file);
      setCurrentFiles((current) => {
        const next = { ...current };
        delete next[fieldId];
        return next;
      });
      setValue(fieldId, "");
    } catch (error) {
      setFileErrors((current) => ({
        ...current,
        [fieldId]: error instanceof Error ? error.message : "Failed to delete file.",
      }));
    } finally {
      setBusyFileField(null);
    }
  };

  const replaceFile = async (fieldId: string, file: File) => {
    const previousFile = currentFiles[fieldId];
    setBusyFileField(fieldId);
    setFileErrors((current) => ({ ...current, [fieldId]: "" }));

    try {
      const uploaded = (await startUpload([file]))?.[0];
      if (!uploaded?.ufsUrl) throw new Error("Upload failed. Please try again.");

      const attached = (await apiClient.uploadRegistrationFile(registrationId, {
        fieldName: fieldId,
        fileUrl: uploaded.ufsUrl,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      })) as FileMeta;
      setCurrentFiles((current) => ({ ...current, [fieldId]: attached }));
      setValue(fieldId, file.name);

      if (previousFile) {
        try {
          await deleteHostedFile(previousFile);
        } catch {
          setFileErrors((current) => ({
            ...current,
            [fieldId]: "Replacement uploaded, but the previous file could not be removed.",
          }));
        }
      }
    } catch (error) {
      setFileErrors((current) => ({
        ...current,
        [fieldId]: error instanceof Error ? error.message : "Failed to upload file.",
      }));
    } finally {
      setBusyFileField(null);
    }
  };

  const renderField = (field: FormField): ReactNode => {
    const value = formValues[field.id];
    switch (field.type) {
      case "textarea": {
        const textValue = typeof value === "string" ? value : "";
        return (
          <div className="space-y-1.5">
            <Textarea
              value={textValue}
              placeholder={field.placeholder}
              disabled={submitting}
              onChange={(event) => setValue(field.id, event.target.value)}
            />
            {(field.validation?.minLength || field.validation?.maxLength) && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {field.validation?.minLength
                    ? `Minimum ${field.validation.minLength} characters.`
                    : ""}
                </span>
                <span>
                  {field.validation?.maxLength
                    ? `${textValue.length}/${field.validation.maxLength}`
                    : `${textValue.length} characters`}
                </span>
              </div>
            )}
          </div>
        );
      }
      case "select":
        return (
          <Select
            value={typeof value === "string" ? value : ""}
            onValueChange={(nextValue) => setValue(field.id, nextValue)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup
            value={typeof value === "string" ? value : ""}
            onValueChange={(nextValue) => setValue(field.id, nextValue)}
            disabled={submitting}
            className="grid gap-3"
          >
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-3 text-base">
                <RadioGroupItem value={option} />
                <span>{option}</span>
              </label>
            ))}
          </RadioGroup>
        );
      case "checkbox": {
        const selected = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-col gap-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-3 text-base">
                <Checkbox
                  checked={selected.includes(option)}
                  disabled={submitting}
                  onCheckedChange={(checked) => {
                    const nextValue = checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option);
                    setValue(field.id, nextValue);
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      }
      case "file":
        const currentFile = currentFiles[field.id];
        const fileBusy = busyFileField === field.id;
        return (
          <div className="space-y-3 rounded-md border bg-muted/50 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">
                  {currentFile?.fileName ?? "No file uploaded"}
                </p>
                {currentFile && (
                  <a
                    href={currentFile.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    View current file
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button asChild type="button" variant="outline" size="sm" disabled={fileBusy}>
                  <label className="cursor-pointer">
                    {fileBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {currentFile ? "Replace" : "Upload"}
                    <input
                      type="file"
                      className="sr-only"
                      accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                      disabled={fileBusy}
                      onChange={(event) => {
                        const selected = event.target.files?.[0];
                        if (selected) void replaceFile(field.id, selected);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </Button>
                {currentFile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={fileBusy}
                    onClick={() => void removeFile(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            {fileErrors[field.id] && <p className="text-destructive">{fileErrors[field.id]}</p>}
          </div>
        );
      default:
        return (
          <Input
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            disabled={submitting}
            onChange={(event) => setValue(field.id, event.target.value)}
          />
        );
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const errors: FieldErrors = {};
    schema.fields.forEach((field) => {
      const messages = field.type === "file" && field.required && !currentFiles[field.id]
        ? ["This file is required."]
        : validateField(field, formValues[field.id]);
      if (messages.length) errors[field.id] = messages;
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = { ...initialValues };
    schema.fields.forEach((field) => {
      formData[field.id] = field.type === "file"
        ? currentFiles[field.id]?.fileName ?? ""
        : formValues[field.id];
    });

    setSubmitting(true);
    try {
      const response = (await apiClient.updateRegistrationApplication(
        registrationId,
        formData,
        notifyApplicant
      )) as RegistrationUpdateResponse;
      setSuccessMessage(response.message);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl space-y-8">
      <div className="space-y-4">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href={applicationsUrl} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Application</h1>
          <p className="mt-1 text-muted-foreground">{eventTitle}</p>
        </div>
      </div>

      <form className="space-y-8 rounded-xl border bg-card p-6 shadow-sm" onSubmit={handleSubmit}>
        {submitError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive">
            {submitError}
          </div>
        )}

        {successMessage ? (
          <div className="space-y-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-900">
            <div className="inline-flex items-center gap-2 text-xl font-semibold">
              <CircleCheck className="h-5 w-5 text-emerald-600" />
              Application Updated
            </div>
            <p>{successMessage}</p>
            <Button variant="outline" asChild>
              <Link href={applicationsUrl}>Return to Applications</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <Checkbox
                id="notify-applicant"
                checked={notifyApplicant}
                disabled={submitting}
                onCheckedChange={(checked) => setNotifyApplicant(checked === true)}
              />
              <label htmlFor="notify-applicant" className="cursor-pointer space-y-1">
                <span className="block font-medium">Notify applicant by email</span>
                <span className="block text-sm text-muted-foreground">
                  Tell the applicant which fields changed and which executive made the update.
                </span>
              </label>
            </div>

            <FieldSet className="space-y-6">
              <FieldSeparator />
              <FieldGroup className="grid gap-6 md:grid-cols-2">
                {schema.fields.map((field) => (
                  <Field
                    key={field.id}
                    className={`gap-2 rounded-lg p-3 ${
                      ["textarea", "checkbox", "file", "radio"].includes(field.type)
                        ? "md:col-span-2"
                        : ""
                    } ${field.type === "file" ? "bg-muted/30" : ""}`}
                  >
                    <FieldLabel>
                      <span className="text-base font-medium">
                        {field.label}
                        {field.required && field.type !== "file" && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </span>
                    </FieldLabel>
                    <FieldContent>
                      {renderField(field)}
                      {field.helperText && (
                        <FieldDescription>{field.helperText}</FieldDescription>
                      )}
                      <FieldError
                        errors={fieldErrors[field.id]?.map((message) => ({ message }))}
                      />
                    </FieldContent>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>

            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
