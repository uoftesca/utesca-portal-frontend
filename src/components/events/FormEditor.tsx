/**
 * FormEditor Component
 *
 * Component for editing registration/feedback forms
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/types/registration';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { FormFieldEditor } from './FormFieldEditor';

interface FormEditorProps {
  fields: FormField[];
  onFieldsChange: (newFields: FormField[]) => void;
}

export function FormEditor({
  fields: initialFields,
  onFieldsChange,
}: Readonly<FormEditorProps>) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    editable: false,
  });

  const updateFields = (newFields: FormField[]) => {
    setFields(newFields);
    onFieldsChange(newFields);
  };

  const handleFieldChange = (id: string, key: keyof FormField, value: any) => {
    updateFields(
      fields.map((field: FormField) => {
        if (field.id === id) {
          return { ...field, [key]: value === '' ? undefined : value };
        } else {
          return field;
        }
      })
    );
  };

  const handleFieldMove = (id: string, dir: 'up' | 'down') => {
    const index = fields.findIndex((field) => field.id === id);
    const newIndex = index + (dir === 'down' ? 1 : -1);
    if (newIndex < 0 || newIndex >= fields.length) return;

    updateFields(fields.map((field, i) => {
      if (i === index) {
        return fields[newIndex];
      } else if (i === newIndex) {
        return fields[index];
      } else {
        return field;
      }
    }));
  };

  const handleFieldDelete = (id: string) => {
    updateFields(fields.filter((field) => field.id !== id));
  };

  const isNewFieldValid = () => {
    return (
      newField.label &&
      newField.type &&
      newField.required !== undefined &&
      newField.editable !== undefined
    );
  };

  const handleNewFieldChange = (key: keyof FormField, value: any) => {
    setNewField({ ...newField, [key]: value });
  };

  const getNewFieldId = () => {
    const initialId = newField.label.trim().toLowerCase()
      .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '_');

    let newId = initialId;
    let count = 0;

    while (fields.some((field) => field.id === newId)) {
      count++;
      newId = initialId + "_" + count;
    }

    return newId;
  }

  const addNewField = () => {
    if (!isNewFieldValid()) return;

    newField.id = getNewFieldId();

    updateFields([...fields, newField]);
    setNewField({
      id: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      editable: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No form fields added yet. Use the section below to add your first field.
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={field.id}
              className="group relative flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md md:flex-row md:items-start"
            >
              <div className="flex items-center gap-1 md:flex-col md:pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleFieldMove(field.id, 'up')}
                  disabled={index === 0}
                  className="h-7 w-7"
                  aria-label="Move field up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleFieldMove(field.id, 'down')}
                  disabled={index === fields.length - 1}
                  className="h-7 w-7"
                  aria-label="Move field down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-start mb-4">
                  <div className="font-mono text-[11px] text-muted-foreground/80 bg-muted/60 border border-border/40 px-2 py-0.5 rounded-md">
                    ID: <span className="font-semibold text-foreground/80">{field.id}</span>
                  </div>
                </div>

                <FormFieldEditor
                  field={field}
                  onFieldChange={(key, value) => handleFieldChange(field.id, key, value)}
                />
              </div>

              <div className="flex items-center justify-end md:pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFieldDelete(field.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete field"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-xl border border-dashed bg-muted/40 p-5 space-y-4">
        <FormFieldEditor
          field={newField}
          onFieldChange={handleNewFieldChange}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            disabled={!isNewFieldValid()}
            onClick={addNewField}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}
