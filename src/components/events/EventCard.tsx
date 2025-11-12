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
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export function EventCard({ event, onClick }: Readonly<EventCardProps>) {
  const [imageError, setImageError] = useState(false);

  // Format date/time for display with timezone
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: userTimezone,
      timeZoneName: "short",
    });
  };

  // Truncate description to 2-3 lines (approximately 120 characters)
  const truncateDescription = (text: string | null) => {
    if (!text) return "No description available";
    const maxLength = 120;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Determine badge variant and label based on status
  const getStatusBadge = () => {
    switch (event.status) {
      case "pending_approval":
        return (
          <Badge variant="outline" className="bg-yellow-700 text-yellow-50 border-yellow-200">
            Pending Approval
          </Badge>
        );
      case "sent_back":
        return (
          <Badge variant="outline" className="bg-red-700 text-red-50 border-red-200">
            Sent Back
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-gray-700 text-gray-50 border-gray-200">
            Draft
          </Badge>
        );
      default:
        return null;
    }
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
        <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center rounded-t-xl">
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
        <div>{getStatusBadge()}</div>
      </CardContent>
    </Card>
  );
}
