/**
 * Schema Utility Functions
 *
 * Utilities for working with registration form schemas and extracting data
 * from form submissions with proper label mapping.
 */

import type { RegistrationFormSchema } from '@/types/registration';

/**
 * Get field label from schema, fallback to formatted field ID
 *
 * @param schema - The registration form schema
 * @param fieldId - The field ID to look up
 * @returns The field label from schema or formatted field ID
 */
export function getFieldLabel(
  schema: RegistrationFormSchema | null | undefined,
  fieldId: string
): string {
  const field = schema?.fields?.find((f) => f.id === fieldId);
  return field?.label || formatFieldName(fieldId);
}

/**
 * Extract name from form data (handles multiple field name patterns)
 *
 * Supports: fullName, firstName + lastName
 * Legacy support: full_name, first_name, last_name
 *
 * @param formData - The form submission data
 * @returns The extracted name or 'Unknown'
 */
export function extractName(formData: Record<string, unknown>): string {
  // Try camelCase (new standard)
  const fullName = formData.fullName;
  const firstName = formData.firstName;
  const lastName = formData.lastName;

  if (typeof fullName === 'string' && fullName) return fullName;

  // Try first + last name
  const first = typeof firstName === 'string' ? firstName : '';
  const last = typeof lastName === 'string' ? lastName : '';
  const combined = `${first} ${last}`.trim();

  if (combined) return combined;

  // Legacy fallback for snake_case
  const legacyFullName = formData.full_name;
  if (typeof legacyFullName === 'string' && legacyFullName) return legacyFullName;

  const legacyFirst = typeof formData.first_name === 'string' ? formData.first_name : '';
  const legacyLast = typeof formData.last_name === 'string' ? formData.last_name : '';
  const legacyCombined = `${legacyFirst} ${legacyLast}`.trim();

  return legacyCombined || 'Unknown';
}

/**
 * Extract email from form data
 *
 * @param formData - The form submission data
 * @returns The email address or empty string
 */
export function extractEmail(formData: Record<string, unknown>): string {
  const email = formData.email;
  return typeof email === 'string' ? email : '';
}

/**
 * Format field name for display (fallback function)
 *
 * Converts snake_case and camelCase to Title Case
 * Example: full_name → Full Name, firstName → First Name
 *
 * @param key - The field key to format
 * @returns The formatted field name
 */
export function formatFieldName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format field value for display with enhanced long text handling
 *
 * Handles arrays, booleans, null/undefined, objects, and primitive values.
 * Preserves formatting for long text (>100 chars) by returning them as-is
 * rather than converting to string representation.
 *
 * @param value - The value to format
 * @returns The formatted value as a string
 *
 * @example
 * formatFieldValue(['a', 'b']) // 'a, b'
 * formatFieldValue(true) // 'Yes'
 * formatFieldValue(null) // '—'
 * formatFieldValue('very long text...') // returns original string
 */
export function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') {
    // Preserve long text as-is for proper formatting in UI
    return value;
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Metadata about how a field value should be displayed
 */
export interface FieldValueMetadata {
  /** Whether the value is long text (>100 chars) that should be displayed in a special container */
  isLongText: boolean;
  /** Whether the value is empty/null/undefined */
  isEmpty: boolean;
  /** Whether the value is a file object */
  isFile: boolean;
}

/**
 * Get metadata for a field value
 *
 * Returns metadata about how the value should be displayed,
 * such as whether it's long text that needs special formatting.
 *
 * @param value - The value to analyze
 * @returns Metadata object with display hints
 *
 * @example
 * getFieldValueMetadata('short') // { isLongText: false, isEmpty: false, isFile: false }
 * getFieldValueMetadata('long text over 100 chars...') // { isLongText: true, isEmpty: false, isFile: false }
 * getFieldValueMetadata(null) // { isLongText: false, isEmpty: true, isFile: false }
 */
export function getFieldValueMetadata(value: unknown): FieldValueMetadata {
  const isEmpty = value === null || value === undefined || value === '';
  const isFile =
    typeof value === 'object' &&
    value !== null &&
    'fileUrl' in value &&
    'fileName' in value;
  const isLongText =
    typeof value === 'string' && value.length > 100 && !isFile;

  return { isLongText, isEmpty, isFile };
}
