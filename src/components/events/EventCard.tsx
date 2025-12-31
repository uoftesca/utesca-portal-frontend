/**
 * EventCard component
 *
 * Displays an individual event in a card format with:
 * - Event image with rounded corners
 * - Event title
 * - Truncated description
 * - Date/time display
 * - Status badge for draft/pending/sent_back events
 */

import { useState } from "react";
import Image from "next/image";
import { Event } from "@/types/event";
import { Card, CardContent } from "@/components/ui/card";
import { EventStatusBadge } from "./EventStatusBadge";
import { Calendar } from "lucide-react";
import { formatInTorontoTime } from "@/lib/timezone";

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export function EventCard({ event, onClick }: Readonly<EventCardProps>) {
  const [imageError, setImageError] = useState(false);

  // Format date/time for display in Toronto timezone
  const formatDateTime = (dateTime: string) => {
    return formatInTorontoTime(dateTime, "MMM d, yyyy h:mm a zzz");
  };

  // Truncate description to 2-3 lines (approximately 120 characters)
  const truncateDescription = (text: string | null) => {
    if (!text) return "No description available";
    const maxLength = 120;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 py-0 gap-0"
      onClick={onClick}
    >
      {/* Event Image */}
      {event.imageUrl && !imageError ? (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 rounded-t-xl">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-accent to-[#2A3441] flex items-center justify-center rounded-t-xl">
          <Calendar className="w-12 h-12 text-gray-500" />
        </div>
      )}

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {truncateDescription(event.description)}
        </p>
        <div className="flex items-center text-xs text-muted-foreground pt-1">
          <Calendar className="w-3 h-3 mr-1" />
          {formatDateTime(event.dateTime)}
        </div>
        {event.status !== 'published' && (
          <div>
            <EventStatusBadge status={event.status} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
