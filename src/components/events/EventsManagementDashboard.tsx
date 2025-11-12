'use client';

/**
 * Events Management Dashboard Component
 *
 * Main dashboard for managing events with tabbed interface
 * Shows all events, published events, and drafts
 */

import { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvents } from '@/hooks/use-events';
import { CreateEventDialog } from './CreateEventDialog';
import { EventCard } from './EventCard';
import type { Event } from '@/types/event';
import type { UserRole } from '@/types/team';

interface EventsManagementDashboardProps {
  userRole?: UserRole;
  onEventClick: (eventId: string) => void;
}

export function EventsManagementDashboard({
  userRole,
  onEventClick,
}: Readonly<EventsManagementDashboardProps>) {
  const [activeTab, setActiveTab] = useState('all');

  // Determine if user can create events (VPs and Co-presidents)
  const canCreate = userRole === 'vp' || userRole === 'co_president';

  // Fetch events based on active tab
  // For 'drafts' tab, we fetch all events and filter client-side
  // For 'published' tab, we fetch only published events
  // React Query will cache both queries separately
  const { data: allEventsData, isLoading: isLoadingAll, error: allEventsError } =
    useEvents();
  const {
    data: publishedEventsData,
    isLoading: isLoadingPublished,
    error: publishedEventsError,
  } = useEvents(activeTab === 'published' ? { status: 'published' } : undefined);

  // Determine which data and loading state to use
  const isLoading =
    activeTab === 'published' ? isLoadingPublished : isLoadingAll;
  const error =
    activeTab === 'published' ? publishedEventsError : allEventsError;

  // Process and sort events based on active tab
  const events = useMemo(() => {
    let eventsToShow: Event[] = [];

    if (activeTab === 'published') {
      eventsToShow = publishedEventsData?.events || [];
    } else if (activeTab === 'drafts') {
      // Filter drafts from all events
      eventsToShow = (allEventsData?.events || []).filter((e) =>
        ['draft', 'pending_approval', 'sent_back'].includes(e.status)
      );
    } else {
      // All events
      eventsToShow = allEventsData?.events || [];
    }

    // Sort events: date (newest first)
    return [...eventsToShow].sort((a, b) => {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    });
  }, [activeTab, allEventsData, publishedEventsData]);

  // Filter events for drafts tab (includes pending_approval and sent_back)
  const getDraftEvents = () => {
    return events.filter((e) =>
      ['draft', 'pending_approval', 'sent_back'].includes(e.status)
    );
  };

  // Render event grid
  const renderEventGrid = (eventsToRender: Event[]) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden gap-0 py-0">
              <Skeleton className="w-full aspect-[16/9] rounded-t-xl" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-md">
          {error instanceof Error ? error.message : 'Failed to load events'}
        </div>
      );
    }

    if (eventsToRender.length === 0) {
      const getEmptyMessage = () => {
        if (activeTab === 'published') {
          return 'No published events yet. Create an event and publish it to see it here.';
        }
        if (activeTab === 'drafts') {
          return 'No draft events. Create a new event to get started.';
        }
        return 'No events yet. Create your first event to get started.';
      };

      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
            <Calendar className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {getEmptyMessage()}
          </p>
          {canCreate && (
            <div className="mt-6">
              <CreateEventDialog />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsToRender.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground">
            Manage and organize UTESCA events
          </p>
        </div>
        {canCreate && <CreateEventDialog />}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderEventGrid(events)}
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          {renderEventGrid(events.filter((e) => e.status === 'published'))}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {renderEventGrid(getDraftEvents())}
        </TabsContent>
      </Tabs>
    </div>
  );
}
