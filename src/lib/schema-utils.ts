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
 * Supports: full_name, fullName, firstName + lastName
 *
 * @param formData - The form submission data
 * @returns The extracted name or 'Unknown'
 */
export function extractName(formData: Record<string, unknown>): string {
  const fullName = formData.full_name;
  const fullNameAlt = formData.fullName;
  const firstName = formData.firstName;
  const lastName = formData.lastName;

  if (typeof fullName === 'string' && fullName) return fullName;
  if (typeof fullNameAlt === 'string' && fullNameAlt) return fullNameAlt;

  const first = typeof firstName === 'string' ? firstName : '';
  const last = typeof lastName === 'string' ? lastName : '';
  const combined = `${first} ${last}`.trim();

  return combined || 'Unknown';
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
 * Format field value for display
 *
 * Handles arrays, booleans, null/undefined, objects, and primitive values
 *
 * @param value - The value to format
 * @returns The formatted value as a string
 */
export function formatFieldValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
