'use client';

/**
 * Event Details Dialog Component
 *
 * Displays event details in view mode, with edit capability for VPs and Co-presidents
 * Handles URL routing through controlled open state
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Edit, Trash2, Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { DeleteEventDialog } from './DeleteEventDialog';
import type { Event, UpdateEventRequest, EventStatus } from '@/types/event';
import type { UserRole } from '@/types/team';

interface EventDetailsDialogProps {
  eventId: string | null;
  userRole?: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Helper to convert datetime-local to ISO 8601 string
const convertToISO = (localDateTime: string): string => {
  if (!localDateTime) return '';
  const date = new Date(localDateTime);
  return date.toISOString();
};

export function EventDetailsDialog({
  eventId,
  userRole,
  open,
  onOpenChange,
  onSuccess,
}: Readonly<EventDetailsDialogProps>) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<UpdateEventRequest>({});
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine if user can edit (VPs and Co-presidents)
  const canEdit = userRole === 'vp' || userRole === 'co_president';

  // Load event data when dialog opens or eventId changes
  useEffect(() => {
    if (open && eventId) {
      loadEvent();
    } else {
      // Reset state when dialog closes
      setEvent(null);
      setIsEditMode(false);
      setError(null);
      setFormData({});
    }
  }, [open, eventId]);

  const loadEvent = async () => {
    if (!eventId) return;

    setLoading(true);
    setError(null);
    setImageError(false);

    try {
      const eventData = (await apiClient.getEventById(eventId)) as Event;
      setEvent(eventData);
      // Initialize form data with event values
      setFormData({
        title: eventData.title,
        description: eventData.description || '',
        dateTime: eventData.dateTime,
        location: eventData.location || '',
        registrationDeadline: eventData.registrationDeadline || '',
        status: eventData.status,
        maxCapacity: eventData.maxCapacity || undefined,
        imageUrl: eventData.imageUrl || '',
        category: eventData.category || '',
        albumLink: eventData.albumLink || '',
        registrationLink: eventData.registrationLink || '',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event) return;

    setError(null);
    setLoading(true);

    try {
      // Clean up formData - remove empty strings for optional fields
      const cleanedData: UpdateEventRequest = {};

      if (formData.title?.trim()) cleanedData.title = formData.title.trim();
      if (formData.description?.trim()) cleanedData.description = formData.description.trim();
      if (formData.dateTime) cleanedData.dateTime = convertToISO(formData.dateTime);
      if (formData.location?.trim()) cleanedData.location = formData.location.trim();
      if (formData.registrationDeadline) {
        cleanedData.registrationDeadline = convertToISO(formData.registrationDeadline);
      }
      if (formData.status) cleanedData.status = formData.status;
      if (formData.maxCapacity && formData.maxCapacity > 0) cleanedData.maxCapacity = formData.maxCapacity;
      if (formData.imageUrl?.trim()) cleanedData.imageUrl = formData.imageUrl.trim();
      if (formData.category?.trim()) cleanedData.category = formData.category.trim();
      if (formData.albumLink?.trim()) cleanedData.albumLink = formData.albumLink.trim();
      if (formData.registrationLink?.trim()) cleanedData.registrationLink = formData.registrationLink.trim();

      await apiClient.updateEvent(event.id, cleanedData);

      setIsEditMode(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  // Format date for display with timezone
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: userTimezone,
      timeZoneName: 'short',
    });
  };

  // Format datetime for input field
  const formatDateTimeForInput = (dateTime: string | null) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get status badge
  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Published
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Approval
          </Badge>
        );
      case 'sent_back':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Sent Back
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Draft
          </Badge>
        );
    }
  };

  // Render dialog content based on loading/error/event state
  const renderDialogContent = () => {
    if (loading && !event) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Loading Event</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading event...</div>
          </div>
        </>
      );
    }

    if (error && !event) {
      return (
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </div>
      );
    }

    if (!event) {
      return null;
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEditMode ? 'Edit Event' : event.title}
          </DialogTitle>
          {!isEditMode && (
            <DialogDescription className="mt-2">
              {getStatusBadge(event.status)}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {!isEditMode ? (
            /* View Mode */
            <div className="space-y-4">
              {/* Event Image */}
              {event.imageUrl && !imageError && (
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDateTime(event.dateTime)}</p>
                  {event.registrationDeadline && (
                    <p className="text-muted-foreground text-xs mt-1">
                      Registration closes: {formatDateTime(event.registrationDeadline)}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{event.location}</p>
                </div>
              )}

              {/* Capacity */}
              {event.maxCapacity && (
                <div className="flex items-start gap-2 text-sm">
                  <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>Max capacity: {event.maxCapacity} attendees</p>
                </div>
              )}

              {/* Category */}
              {event.category && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Category: </span>
                  <span className="font-medium">{event.category}</span>
                </div>
              )}

              {/* Description */}
              {event.description && (
                <div className="pt-2 border-t">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Links */}
              {(event.registrationLink || event.albumLink) && (
                <div className="pt-2 border-t space-y-2">
                  <h4 className="font-semibold mb-2">Links</h4>
                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Registration Form
                    </a>
                  )}
                  {event.albumLink && (
                    <a
                      href={event.albumLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Photo Album
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dateTime">
                    Date & Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-dateTime"
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.dateTime || null)}
                    onChange={(e) =>
                      setFormData({ ...formData, dateTime: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Time in: <span className="font-medium">America/Toronto (EST/EDT)</span>
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="edit-registrationDeadline"
                    type="datetime-local"
                    value={formatDateTimeForInput(formData.registrationDeadline || null)}
                    onChange={(e) =>
                      setFormData({ ...formData, registrationDeadline: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Time in: <span className="font-medium">America/Toronto (EST/EDT)</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxCapacity">Max Capacity</Label>
                  <Input
                    id="edit-maxCapacity"
                    type="number"
                    min="1"
                    value={formData.maxCapacity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxCapacity: e.target.value ? Number.parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: EventStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-registrationLink">Registration Link</Label>
                <Input
                  id="edit-registrationLink"
                  type="url"
                  value={formData.registrationLink}
                  onChange={(e) =>
                    setFormData({ ...formData, registrationLink: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-albumLink">Album Link</Label>
                <Input
                  id="edit-albumLink"
                  type="url"
                  value={formData.albumLink}
                  onChange={(e) =>
                    setFormData({ ...formData, albumLink: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between items-center">
          {!isEditMode ? (
            <>
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)} className="ml-auto">
                Close
              </Button>
            </>
          ) : (
            <>
              {canEdit && (
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditMode(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </DialogFooter>

        {/* Delete Dialog */}
        {event && (
          <DeleteEventDialog
            event={event}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleDelete}
          />
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
