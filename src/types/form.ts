/**
 * Form Types
 *
 * Type definitions for custom forms system matching backend Pydantic models
 */

/**
 * Form field input types matching backend FormFieldType enum
 */
export type FormFieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';

/**
 * Allowed file types for field validation matching backend AllowedFileType enum
 */
export type AllowedFileType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif';

/**
 * Form field validation schema structure
 */
export interface FieldValidationSchema {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  maxSize?: number;
  allowedTypes?: AllowedFileType[];
}


/**
 * Form field definition
 */
export interface FormFieldSchema {
  id: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  helperText?: string;
  options?: string[];
  validation?: FieldValidationSchema;
  required: boolean;
  editable: boolean;
}
