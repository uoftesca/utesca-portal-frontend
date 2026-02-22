'use client';

/**
 * Status Filter Cards Component
 *
 * Card-based status filter for filtering registrations with visual hierarchy
 * Replaces the traditional tab interface with clickable cards
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RegistrationStatus, StatusCounts } from '@/types/registration';

interface StatusFilterCardsProps {
  activeStatus: RegistrationStatus | 'all';
  onStatusChange: (status: RegistrationStatus | 'all') => void;
  counts: StatusCounts;
}

interface StatusCard {
  value: RegistrationStatus | 'all';
  label: string;
  count: number;
}

export function StatusFilterCards({
  activeStatus,
  onStatusChange,
  counts,
}: Readonly<StatusFilterCardsProps>) {
  const totalCount =
    counts.submitted + counts.accepted + counts.rejected + counts.confirmed + counts.notAttending;

  const statusCards: StatusCard[] = [
    { value: 'all', label: 'All', count: totalCount },
    { value: 'submitted', label: 'Submitted', count: counts.submitted },
    { value: 'accepted', label: 'Accepted', count: counts.accepted },
    { value: 'waitlist', label: 'Waitlisted', count: counts.accepted },
    { value: 'rejected', label: 'Rejected', count: counts.rejected },
    { value: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { value: 'not_attending', label: 'Not Attending', count: counts.notAttending },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      {statusCards.map((card) => (
        <Card
          key={card.value}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md border-2',
            activeStatus === card.value
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-transparent hover:border-border'
          )}
          onClick={() => onStatusChange(card.value)}
        >
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <Badge
              variant={activeStatus === card.value ? 'default' : 'secondary'}
              className="text-base font-semibold"
            >
              {card.count}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
