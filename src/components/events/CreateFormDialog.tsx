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

interface CreateFormDialog {
  form: RegistrationFormSchema;
  onFormSave: (form: RegistrationFormSchema) => void;
}

export function CreateFormDialog({
  form: initialForm,
  onFormSave: onFormSave
}: Readonly<CreateFormDialog>) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<RegistrationFormSchema>(initialForm);
  const [changed, setChanged] = useState(false);

  const handleSave = () => {
    onFormSave(form);
    setOpen(false);
    setChanged(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {changed ? "Edit Form" : "Create Form"}
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
