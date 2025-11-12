'use client';

/**
 * Create Event Dialog Component
 *
 * Dialog for VPs and Co-presidents to create new events
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import type { CreateEventRequest, EventStatus } from '@/types/event';

interface CreateEventDialogProps {
  onSuccess?: () => void;
}

// Helper to convert datetime-local to ISO 8601 string
// The datetime-local input gives us local time
// Need to ensure it's properly formatted
const convertToISO = (localDateTime: string): string => {
  if (!localDateTime) return '';
  // datetime-local format: YYYY-MM-DDTHH:mm
  // Append seconds if not present and convert to ISO
  const date = new Date(localDateTime);
  return date.toISOString();
};

export function CreateEventDialog({ onSuccess }: Readonly<CreateEventDialogProps>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: '',
    dateTime: '',
    description: '',
    location: '',
    registrationDeadline: '',
    status: 'draft',
    maxCapacity: undefined,
    imageUrl: '',
    category: '',
    albumLink: '',
    registrationLink: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Clean up formData
      // Remove empty strings for optional fields
      const cleanedData: CreateEventRequest = {
        title: formData.title,
        dateTime: convertToISO(formData.dateTime),
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.description?.trim()) cleanedData.description = formData.description.trim();
      if (formData.location?.trim()) cleanedData.location = formData.location.trim();
      if (formData.registrationDeadline) {
        cleanedData.registrationDeadline = convertToISO(formData.registrationDeadline);
      }
      if (formData.maxCapacity && formData.maxCapacity > 0) cleanedData.maxCapacity = formData.maxCapacity;
      if (formData.imageUrl?.trim()) cleanedData.imageUrl = formData.imageUrl.trim();
      if (formData.category?.trim()) cleanedData.category = formData.category.trim();
      if (formData.albumLink?.trim()) cleanedData.albumLink = formData.albumLink.trim();
      if (formData.registrationLink?.trim()) cleanedData.registrationLink = formData.registrationLink.trim();

      await apiClient.createEvent(cleanedData);

      // Reset form
      setFormData({
        title: '',
        dateTime: '',
        description: '',
        location: '',
        registrationDeadline: '',
        status: 'draft',
        maxCapacity: undefined,
        imageUrl: '',
        category: '',
        albumLink: '',
        registrationLink: '',
      });

      setOpen(false);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a new event for UTESCA. Fill in the event details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Required Fields */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Event Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g., Alumni Panel 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dateTime">
                  Date & Time <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
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
                <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                <Input
                  id="registrationDeadline"
                  type="datetime-local"
                  value={formData.registrationDeadline}
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the event..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., BA3300"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Networking, Workshop"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  min="1"
                  value={formData.maxCapacity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCapacity: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EventStatus) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Raw image URL to featured image
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="registrationLink">Registration Link</Label>
              <Input
                id="registrationLink"
                type="url"
                value={formData.registrationLink}
                onChange={(e) =>
                  setFormData({ ...formData, registrationLink: e.target.value })
                }
                placeholder="https://forms.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                External registration form link
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="albumLink">Album Link</Label>
              <Input
                id="albumLink"
                type="url"
                value={formData.albumLink}
                onChange={(e) =>
                  setFormData({ ...formData, albumLink: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
              <p className="text-xs text-muted-foreground">
                Link to event photo album
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
