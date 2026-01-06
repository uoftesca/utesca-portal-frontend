'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { DashboardLayout, DashboardTabContent } from './(dashboard)/components';
import { EventDetailsDialog } from '@/components/events';
import { ApplicationsDashboard } from '@/components/events/registrations';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent to-[#2A3441]">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Get event ID and view from URL query params
  const eventId = searchParams.get('event');
  const view = searchParams.get('view');

  // Update active tab when viewing applications
  useEffect(() => {
    if (eventId && view === 'applications') {
      setActiveTab('events');
    }
  }, [eventId, view]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Clear URL parameters when switching tabs
    router.push('/');
  };

  // Handle opening event modal by adding event ID to URL
  const handleEventClick = (eventId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', eventId);
    router.push(`/?${params.toString()}`);
  };

  // Handle closing event modal by removing event ID from URL
  const handleEventModalClose = (open: boolean) => {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('event');
      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : '/');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      eventId={eventId}
      view={view}
      onTabChange={handleTabChange}
    >
      {eventId && view === 'applications' ? (
        <ApplicationsDashboard
          eventId={eventId}
          userRole={user?.role}
        />
      ) : (
        <DashboardTabContent
          activeTab={activeTab}
          user={user}
          userRole={user?.role}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event Details Dialog - controlled by URL */}
      <EventDetailsDialog
        eventId={eventId}
        userRole={user?.role}
        open={!!eventId && view !== 'applications'}
        onOpenChange={handleEventModalClose}
        onSuccess={() => {
          // Events will automatically refresh via React Query cache invalidation
          handleEventModalClose(false);
        }}
      />
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <DashboardContent />
    </Suspense>
  );
}
