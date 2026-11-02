/**
 * FormEditor Component
 *
 * Component for editing registration/feedback forms
 */

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormField, FormFieldType, FormFieldValidation } from '@/types/registration';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { FormOptionsEditor } from '@/components/events/FormOptionEditor';

interface FormEditorProps {
  fields: FormField[];
  onFieldsChange: (newFields: FormField[]) => void;
}

export function FormEditor({
  fields: initialFields,
  onFieldsChange: onFieldsChange,
}: Readonly<FormEditorProps>) {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [newField, setNewField] = useState<FormField>({
    id: '',
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    editable: false
  });

  // TODO: Enforce unique ids

  const updateFields = (newFields: FormField[]) => {
    setFields(newFields);
    onFieldsChange(newFields);
  }

  const handleFieldChange = (id: string, key: keyof FormField, value: any) => {
    updateFields(fields.map((field: FormField) => {
      return field.id === id ? { ...field, [key]: value === "" ? undefined : value } : field;
    }));
  }

  const handleFieldMove = (id: string, dir: 'up' | 'down') => {
    const index = fields.findIndex((field) => field.id == id);
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
  }

  const handleFieldDelete = (id: string) => {
    updateFields(fields.filter((field) => field.id !== id));
  }

  const isNewFieldValid = () => {
    if (
      !newField.id || !newField.type || !newField.label ||
      newField.required === undefined || newField.editable === undefined
    ) {
      return false;
    }

    return true;
  }

  const handleNewFieldChange = (key: keyof FormField, value: any) => {
    setNewField({ ...newField, [key]: value });
  }

  const addNewField = () => {
    if (!isNewFieldValid()) {
      return;
    }

    updateFields([ ...fields, newField ]);
    setNewField({
      id: '',
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
      editable: false
    });
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Placeholder</TableHead>
            <TableHead>Options</TableHead>
            <TableHead>Validation</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Editable</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              <TableCell>
                <Input
                  value={field.id}
                  onChange={(e) => {
                    handleFieldChange(field.id, "id", e.target.value);
                  }}
                ></Input>
              </TableCell>
              <TableCell>
                <Select
                  value={field.type}
                  onValueChange={(value: FormFieldType) => {
                    handleFieldChange(field.id, "type", value);
                  }}
                >
                  <SelectTrigger id="edit-field-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="textarea">Text Area</SelectItem>
                    <SelectItem value="select">Select</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="checkbox">Checkbox</SelectItem>
                    <SelectItem value="file">File</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  value={field.label}
                  onChange={(e) => handleFieldChange(field.id, "label", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input
                  value={field.placeholder}
                  onChange={(e) => handleFieldChange(field.id, "placeholder", e.target.value || undefined)}
                />
              </TableCell>
              <TableCell>
                <FormOptionsEditor
                  options={field.options || []}
                  onOptionsChange={(newOptions) => handleFieldChange(field.id, "options", newOptions)}
                  disabled={field.type !== "select" && field.type !== "radio" && field.type !== "checkbox"}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) => handleFieldChange(field.id, "required", !!checked)}
                />
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={field.editable}
                  onCheckedChange={(checked) => handleFieldChange(field.id, "editable", !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <div className="h-8 w-8 inline-flex flex-col rounded-md border border-input bg-background overflow-hidden shadow-xs">
                    <Button
                      onClick={() => handleFieldMove(field.id, "up")}
                      disabled={index === 0}
                      className="flex h-1/2 w-full items-center justify-center rounded-none"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleFieldMove(field.id, "down")}
                      disabled={index === fields.length - 1}
                      className="flex h-1/2 w-full items-center justify-center rounded-none"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleFieldDelete(field.id)}
                    className="h-8 w-8"
                  >
                    <X />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-secondary/20 hover:bg-secondary/40">
            <TableCell>
              <Input
                value={newField.id}
                onChange={(e) => handleNewFieldChange("id", e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Select
                value={newField.type}
                onValueChange={(value: FormFieldType) => handleNewFieldChange("type", value)}
              >
                <SelectTrigger id="edit-field-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Input
                value={newField.label}
                onChange={(e) => handleNewFieldChange("label", e.target.value)}
              />
            </TableCell>
            <TableCell>
              <Input
                value={newField.placeholder}
                onChange={(e) => handleNewFieldChange("placeholder", e.target.value)}
              />
            </TableCell>
            <TableCell>
              <FormOptionsEditor
                options={newField.options || []}
                onOptionsChange={(newOptions) => handleNewFieldChange("options", newOptions)}
                disabled={newField.type !== "select" && newField.type !== "radio" && newField.type !== "checkbox"}
              />
            </TableCell>
            <TableCell></TableCell>
            <TableCell>
              <Checkbox
                checked={newField.required}
                onCheckedChange={(checked) => handleNewFieldChange("required", !!checked)}
              />
            </TableCell>
            <TableCell>
              <Checkbox
                checked={newField.editable}
                onCheckedChange={(checked) => handleNewFieldChange("editable", !!checked)}
              />
            </TableCell>
            <TableCell className="text-right">
              <Button
                disabled={!isNewFieldValid()}
                onClick={addNewField}
                className="w-8 h-8"
              >
                <Plus />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
