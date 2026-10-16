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
import type { AttendanceCounts } from '@/types/registration';

interface AttendanceFilterCardsProps {
  activeAttendance: boolean | 'all';
  onAttendanceChange: (attended: boolean | 'all') => void;
  counts: AttendanceCounts;
}

interface AttendanceCard {
  value: boolean | 'all';
  label: string;
  count: number;
}

export function AttendanceFilterCards({
  activeAttendance: activeAttendance,
  onAttendanceChange,
  counts,
}: Readonly<AttendanceFilterCardsProps>) {
  const totalCount = counts.attended + counts.absent;

  const attendanceCards: AttendanceCard[] = [
    { value: 'all', label: 'All', count: totalCount },
    { value: true, label: 'Attended', count: counts.attended },
    { value: false, label: 'Absent', count: counts.absent }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
      {attendanceCards.map((card) => (
        <Card
          key={card.value.toString()}
          className={cn(
            'cursor-pointer transition-all hover:shadow-md border-2',
            activeAttendance === card.value
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-transparent hover:border-border'
          )}
          onClick={() => onAttendanceChange(card.value)}
        >
          <CardContent className="p-4 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">{card.label}</p>
            <Badge
              variant={activeAttendance === card.value ? 'default' : 'secondary'}
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
