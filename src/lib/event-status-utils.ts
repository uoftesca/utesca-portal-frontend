/**
 * Event Status Utility Functions
 *
 * Shared utilities for event status handling and display
 */

import type { EventStatus } from '@/types/event';

/**
 * Get badge variant for event status
 */
export function getEventStatusVariant(
  status: EventStatus
): 'default' | 'outline' | 'destructive' | 'secondary' | 'success' | 'warning' | 'gray' {
  switch (status) {
    case 'published':
      return 'success';
    case 'pending_approval':
      return 'warning';
    case 'sent_back':
      return 'destructive';
    case 'draft':
      return 'gray';
    default:
      return 'default';
  }
}

/**
 * Format event status string for display
 */
export function formatEventStatus(status: EventStatus): string {
  switch (status) {
    case 'pending_approval':
      return 'Pending Approval';
    case 'sent_back':
      return 'Sent Back';
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    default:
      return status;
  }
}
