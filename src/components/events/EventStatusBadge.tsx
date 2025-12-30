/**
 * Event Status Badge Component
 *
 * Reusable badge component for displaying event status
 */

import { Badge } from '@/components/ui/badge';
import { getEventStatusVariant, formatEventStatus } from '@/lib/event-status-utils';
import type { EventStatus } from '@/types/event';

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: Readonly<EventStatusBadgeProps>) {
  return (
    <Badge variant={getEventStatusVariant(status)} className={className}>
      {formatEventStatus(status)}
    </Badge>
  );
}
