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
): 'default' | 'outline' | 'destructive' | 'secondary' | 'success' {
  switch (status) {
    case 'submitted':
      return 'default';
    case 'accepted':
      return 'outline';
    case 'rejected':
      return 'destructive';
    case 'confirmed':
      return 'success';
    default:
      return 'default';
  }
}

/**
 * Format registration status string for display
 */
export function formatRegistrationStatus(status: RegistrationStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
