'use client';

/**
 * Create Form Dialog Component
 *
 * Dialog to save forms for event creation and editing
 */

import { useState } from 'react';
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
import { FormEditor } from '@/components/events/FormEditor';
import { RegistrationFormSchema } from '@/types/registration';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';

interface CreateFormDialog {
  form: RegistrationFormSchema;
  onFormSave: (form?: RegistrationFormSchema) => void;
}

export function CreateFormDialog({
  form: initialForm,
  onFormSave: onFormSave
}: Readonly<CreateFormDialog>) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RegistrationFormSchema>(initialForm);
  const [lastForm, setLastForm] = useState<RegistrationFormSchema | undefined>(undefined);

  const handleDelete = () => {
    setForm(initialForm);
    setLastForm(undefined);
    onFormSave(undefined);
    setOpen(false);
  }

  const handleCancel = () => {
    setForm(lastForm || initialForm);
    setOpen(false);
  }

  const handleSave = () => {
    setLastForm(form);
    onFormSave(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {lastForm ? "Edit Form" : "Create Form"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
          <DialogDescription>
            Create a new form for this event. Fill in the form details below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="registrationDeadline">Auto Accept</Label>
            <Checkbox
              id="registrationDeadline"
              checked={form.autoAccept}
              onCheckedChange={(checked) => setForm({ ...form, autoAccept: !!checked })}
            />
          </div>

          <FormEditor fields={form.fields} onFieldsChange={(newFields) => {
            setForm({ ...form, fields: newFields });
          }} />
        </div>

        <DialogFooter className="flex flex-row justify-between items-center">
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
