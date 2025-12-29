/**
 * Status Utility Functions
 *
 * Shared utilities for registration status handling and display
 */

/**
 * Get badge variant for event registration status
 */
export function getStatusVariant(
  status: string
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
 * Format status string for display (capitalize first letter)
 */
export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
