/**
 * Registration Status Utility Functions
 *
 * Shared utilities for event registration status handling and display
 */

import type { RegistrationStatus } from '@/types/registration';

/**
 * Get badge variant for event registration status
 */
export function getRegistrationStatusVariant(
  status: RegistrationStatus
): 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' | 'success' {
  switch (status) {
    case 'submitted':
      return 'default';
    case 'waitlist':
      return 'secondary';
    case 'accepted':
      return 'secondary';
    case 'rejected':
      return 'destructive';
    case 'confirmed':
      return 'success';
    case 'not_attending':
    case 'withdrawn':
    case 'pending_verification':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Format registration status string for display
 */
export function formatRegistrationStatus(status: RegistrationStatus): string {
  return status.split("_")
    .map((word) => { return word.charAt(0).toUpperCase() + word.slice(1); })
    .join(" ");
}
