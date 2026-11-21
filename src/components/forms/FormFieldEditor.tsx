/**
 * FormFieldEditor Component
 *
 * Component for editing a form field
 */

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormFieldSchema, FormFieldType } from '@/types/form';
import { FormOptionsEditor } from './FormOptionsEditor';
import { FormValidationEditor } from './FormValidationEditor';

interface FormFieldEditorProps {
  field: FormFieldSchema;
  onFieldChange: (key: keyof FormFieldSchema, value: any) => void;
}

export function FormFieldEditor({
  field,
  onFieldChange,
}: Readonly<FormFieldEditorProps>) {
  const isPlaceholderType = field.type === 'text' || field.type === 'textarea';
  const isOptionType = field.type === 'select' || field.type === 'radio' || field.type === 'checkbox';
  const isValidationType = field.type === 'text' || field.type === 'textarea' || field.type === 'file';

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Label</Label>
          <Input
            value={field.label ?? ''}
            onChange={(e) => onFieldChange('label', e.target.value)}
            placeholder="Field Label"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Input Type</Label>
          <Select
            value={field.type}
            onValueChange={(value: FormFieldType) => onFieldChange('type', value)}
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Helper Text</Label>
          <Input
            value={field.helperText ?? ''}
            onChange={(e) => onFieldChange('helperText', e.target.value)}
            placeholder="Field Helper Text"
          />
        </div>
      </div>

      {(isPlaceholderType || isOptionType || isValidationType) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isPlaceholderType && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Placeholder</Label>
              <Input
                value={field.placeholder ?? ''}
                onChange={(e) => onFieldChange('placeholder', e.target.value || undefined)}
                placeholder="Optional Placeholder"
              />
            </div>
          )}

          {isOptionType && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Options</Label>
              <FormOptionsEditor
                options={field.options || []}
                onOptionsChange={(newOptions) => onFieldChange('options', newOptions)}
              />
            </div>
          )}

          {isValidationType && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Validation</Label>
              <FormValidationEditor
                fieldType={field.type}
                validation={field.validation || {}}
                onValidationChange={(newValidation) => onFieldChange('validation', newValidation)}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer">
          <Checkbox
            checked={field.required}
            onCheckedChange={(checked) => onFieldChange('required', !!checked)}
          />
          Required
        </label>

        <label className="flex items-center gap-2 text-sm font-medium leading-none cursor-pointer">
          <Checkbox
            checked={field.editable}
            onCheckedChange={(checked) => onFieldChange('editable', !!checked)}
          />
          Editable
        </label>
      </div>
    </div>
  );
}
