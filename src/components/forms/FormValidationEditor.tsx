/**
 * FormValidationEditor Component
 *
 * Popover for editing a field's validation rules
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormFieldType, FieldValidationSchema, AllowedFileType } from '@/types/form';
import { SlidersHorizontal } from 'lucide-react';

interface FormValidationEditorProps {
  fieldType: FormFieldType;
  validation: FieldValidationSchema;
  onValidationChange: (newValidation: FieldValidationSchema) => void;
}

const COMMON_PATTERNS: { label: string, value: string }[] = [
  { label: 'None', value: 'none' },
  { label: 'Name', value: "^[p{L}p{M}]+(?:[' -][p{L}p{M}]+)*$" },
  { label: 'Full Name', value: "^[p{L}p{M}]+(?:[' -][p{L}p{M}]+)*(?:s+[p{L}p{M}]+(?:[' -][p{L}p{M}]+)*)+$" },
  { label: 'UTORid', value: '^[a-z0-9]{7,8}$' },
  { label: 'Email Address', value: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
  { label: 'U of T Email Address', value: '^[\\w-\\.]+@mail\.utoronto\.ca$/' },
  { label: 'Phone Number', value: '^\\+?[1-9][0-9\\s.-]{1,18}$' },
  { label: 'URL / Website', value: '^(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)*\\/?$' },
  { label: 'Alphanumeric Only', value: '^[a-zA-Z0-9]+$' },
  { label: 'Custom Regex', value: 'custom' },
];

const DEFAULT_CUSTOM_REGEX = '^.*$';

const ALLOWED_FILE_TYPES: { label: string, value: AllowedFileType }[] = [
  { label: 'PDF Document (application/pdf)', value: 'application/pdf' },
  { label: 'JPEG Image (image/jpeg)', value: 'image/jpeg' },
  { label: 'PNG Image (image/png)', value: 'image/png' },
  { label: 'WebP Image (image/webp)', value: 'image/webp' },
  { label: 'HEIC Image (image/heic)', value: 'image/heic' },
  { label: 'HEIF Image (image/heif)', value: 'image/heif' },
];

export function FormValidationEditor({
  fieldType,
  validation = {},
  onValidationChange,
}: Readonly<FormValidationEditorProps>) {
  const isTextField = fieldType === 'text' || fieldType === 'textarea';
  const isFileField = fieldType === 'file';

  const handleChange = (key: keyof FieldValidationSchema, value: FieldValidationSchema[keyof FieldValidationSchema]) => {
    onValidationChange({ ...validation, [key]: value });
  };

  const isCommonPattern = COMMON_PATTERNS.some((p) => p.value === validation.pattern);
  const patternSelectVal = validation.pattern == null ? 'none' : isCommonPattern ? validation.pattern : 'custom';

  let selectedTypes = validation.allowedTypes ?? [];

  const handleAllowedTypeToggle = (type: AllowedFileType, checked: boolean) => {
    if (checked) {
      if (!selectedTypes.includes(type)) selectedTypes = [...selectedTypes, type];
    } else {
      selectedTypes = selectedTypes.filter((value) => value != type);
    }

    handleChange('allowedTypes', selectedTypes.length > 0 ? selectedTypes : undefined);
  };

  const activeRulesCount = Object.values(validation).filter((value) => value !== null).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {activeRulesCount > 0 ? `${activeRulesCount} rule${activeRulesCount > 1 ? 's' : ''} set` : 'No rules set'}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 space-y-4 max-h-[450px] overflow-y-auto">
        <div className="space-y-1">
          <h4 className="font-medium text-xs leading-none">Validation Rules</h4>
          <p className="text-xs text-muted-foreground">
            {isTextField ? 'Configure text constraints and formatting.' : 'Configure file size and allowed types.'}
          </p>
        </div>

        {isTextField && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Min Characters</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-8 text-xs"
                  value={validation.minLength ?? ''}
                  onChange={(e) => handleChange('minLength', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 3"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Max Characters</Label>
                <Input
                  type="number"
                  min={0}
                  className="h-8 text-xs"
                  value={validation.maxLength ?? ''}
                  onChange={(e) => handleChange('maxLength', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 255"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px]">Format Pattern</Label>
              <Select
                value={patternSelectVal}
                onValueChange={(value) =>
                  handleChange('pattern', value === 'none' ? undefined : value === 'custom' ? DEFAULT_CUSTOM_REGEX : value)
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_PATTERNS.map((pattern) => (
                    <SelectItem key={pattern.label} value={pattern.value} className="text-xs">
                      {pattern.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {patternSelectVal === 'custom' && (
              <div className="space-y-1">
                <Label className="text-[11px]">Custom Regex Pattern</Label>
                <Input
                  type="text"
                  className="h-8 text-xs font-mono"
                  value={validation.pattern ?? ''}
                  onChange={(e) => handleChange('pattern', e.target.value)}
                  placeholder="e.g. ^[A-Z]{3}-\d{4}$"
                />
              </div>
            )}
          </div>
        )}

        {isFileField && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Max File Size (MB)</Label>
              <Input
                type="number"
                min={0}
                className="h-8 text-xs"
                value={validation.maxSize ? validation.maxSize / (1024 * 1024) : ''}
                onChange={(e) => {
                  const mb = e.target.value ? Number(e.target.value) : undefined;
                  handleChange('maxSize', mb ? mb * 1024 * 1024 : undefined);
                }}
                placeholder="e.g. 5"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px]">Allowed File Types</Label>
                <span className="text-[10px] text-muted-foreground italic">
                  {selectedTypes.length > 0 ? `${selectedTypes.length} selected` : 'Defaults to all types'}
                </span>
              </div>

              <div className="grid gap-1.5 rounded-md border bg-muted/30 p-2.5">
                {ALLOWED_FILE_TYPES.map((type) => {
                  return (
                    <label
                      key={type.value}
                      className="flex items-center gap-2 text-xs font-normal cursor-pointer py-0.5"
                    >
                      <Checkbox
                        checked={selectedTypes.includes(type.value)}
                        onCheckedChange={(checked) => handleAllowedTypeToggle(type.value, !!checked)}
                      />
                      <span className="truncate">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
