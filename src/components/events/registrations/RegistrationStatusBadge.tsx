/**
 * Registration Status Badge Component
 *
 * Reusable badge component for displaying event registration status
 */

import { Badge } from '@/components/ui/badge';
import { getRegistrationStatusVariant, formatRegistrationStatus } from '@/lib/registration-status-utils';
import type { RegistrationStatus } from '@/types/registration';

interface RegistrationStatusBadgeProps {
  status: RegistrationStatus;
  className?: string;
}

export function RegistrationStatusBadge({ status, className }: Readonly<RegistrationStatusBadgeProps>) {
  return (
    <Badge variant={getRegistrationStatusVariant(status)} className={className}>
      {formatRegistrationStatus(status)}
    </Badge>
  );
}
