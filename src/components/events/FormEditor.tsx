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
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';

interface FormEditorProps {
  initialForm: FormField[];
  onFormChange: (newForm: FormField[]) => void;
}

export function FormEditor({
  initialForm,
  onFormChange
}: Readonly<FormEditorProps>) {
  const [fields, setFields] = useState<FormField[]>(initialForm);
  const [newField, setNewField] = useState<Partial<FormField>>({
    required: false,
    editable: false
  });

  const updateFields = (newFields: FormField[]) => {
    setFields(newFields);
    onFormChange(newFields);
  }

  const handleFieldChange = (id: string, key: keyof FormField, value: any) => {
    updateFields(fields.map((field: FormField) => {
      return field.id === id ? { ...field, [key]: value } : field;
    }));
  }

  const handleFieldMove = (id: string, dir: "up" | "down") => {
    const index = fields.findIndex((field) => field.id == id);
    const newIndex = index + (dir === "up" ? 1 : -1);
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    const [movedField] = newFields.splice(index, 1);
    newFields.splice(newIndex, 0, movedField)

    updateFields(newFields);
  }

  const handleFieldDelete = (id: string) => {
    updateFields(fields.filter((field) => field.id === id));
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

    updateFields([ ...fields, newField as FormField ]);
    setNewField({
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
          {fields.map((field) => (
            <TableRow>
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
                ></Input>
              </TableCell>
              <TableCell>
                <Input
                  value={field.placeholder}
                  onChange={(e) => handleFieldChange(field.id, "placeholder", e.target.value || undefined)}
                ></Input>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell>
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) => handleFieldChange(field.id, "required", !!checked)}
                ></Checkbox>
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={field.editable}
                  onCheckedChange={(checked) => handleFieldChange(field.id, "editable", !!checked)}
                ></Checkbox>
              </TableCell>
              <TableCell>
                <Button
                  disabled={!isNewFieldValid()}
                  onClick={() => handleFieldMove(field.id, "up")}
                >
                  <ArrowUp />
                </Button>
                <Button
                  disabled={!isNewFieldValid()}
                  onClick={() => handleFieldMove(field.id, "down")}
                >
                  <ArrowDown />
                </Button>
                <Button
                  disabled={!isNewFieldValid()}
                  onClick={() => handleFieldDelete(field.id)}
                >
                  <X />
                </Button>
              </TableCell>
            </TableRow>
          ))}

          <TableRow className="bg-gray-50/50">
            <TableCell>
              <Input
                value={newField.id}
                onChange={(e) => handleNewFieldChange("id", e.target.value)}
              ></Input>
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
              ></Input>
            </TableCell>
            <TableCell>
              <Input
                value={newField.placeholder}
                onChange={(e) => handleNewFieldChange("placeholder", e.target.value)}
              ></Input>
            </TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>
              <Checkbox
                checked={newField.required}
                onCheckedChange={(checked) => handleNewFieldChange("required", !!checked)}
              ></Checkbox>
            </TableCell>
            <TableCell>
              <Checkbox
                checked={newField.editable}
                onCheckedChange={(checked) => handleNewFieldChange("editable", !!checked)}
              ></Checkbox>
            </TableCell>
            <TableCell colSpan={2} className="text-right">
              <Button
                disabled={!isNewFieldValid()}
                onClick={addNewField}
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
