/**
 * Timezone utilities for UTESCA events
 * All events are displayed and managed in America/Toronto timezone
 */

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const TORONTO_TZ = 'America/Toronto';

/**
 * Format a UTC datetime string for display in Toronto timezone
 * @param utcDateTimeString - ISO 8601 UTC string (e.g., "2025-01-15T19:00:00Z")
 * @param formatString - date-fns format string (default: full datetime with timezone)
 * @returns Formatted string in Toronto time
 */
export function formatInTorontoTime(
  utcDateTimeString: string,
  formatString: string = "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
): string {
  return formatInTimeZone(new Date(utcDateTimeString), TORONTO_TZ, formatString);
}

/**
 * Format a UTC datetime string for datetime-local input (Toronto time)
 * @param utcDateTimeString - ISO 8601 UTC string
 * @returns YYYY-MM-DDTHH:mm string representing Toronto time
 */
export function formatForDateTimeInput(utcDateTimeString: string | null): string {
  if (!utcDateTimeString) return '';

  // Convert UTC to Toronto time, then format for datetime-local
  return formatInTimeZone(new Date(utcDateTimeString), TORONTO_TZ, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Convert datetime-local input value (Toronto time) to UTC ISO string
 * @param dateTimeLocalValue - YYYY-MM-DDTHH:mm string from datetime-local input
 * @returns ISO 8601 UTC string for API
 */
export function convertTorontoTimeToUTC(dateTimeLocalValue: string): string {
  if (!dateTimeLocalValue) return '';

  // Parse the datetime-local value as if it's in Toronto timezone
  // The input is in format "YYYY-MM-DDTHH:mm" with no timezone info
  // We need to treat this as Toronto time and convert to UTC
  const [datePart, timePart] = dateTimeLocalValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create a date object representing this time in Toronto
  const torontoDate = new Date(year, month - 1, day, hours, minutes);

  // Convert from Toronto timezone to UTC
  const utcDate = fromZonedTime(torontoDate, TORONTO_TZ);

  return utcDate.toISOString();
}
