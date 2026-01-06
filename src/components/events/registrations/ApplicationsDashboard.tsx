'use client';

/**
 * Applications Dashboard Component
 *
 * Full-page view for managing event registrations with table layout,
 * status filters, search, and inline actions
 */

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  useRegistrations,
  useRegistrationCounts,
  useExportRegistrations,
} from '@/hooks/use-registrations';
import { useEvent } from '@/hooks/use-events';
import { StatusFilterCards } from './StatusFilterCards';
import { ApplicationsTable } from './ApplicationsTable';
import { ApplicationDetailModal } from './ApplicationDetailModal';
import type { RegistrationStatus } from '@/types/registration';
import type { UserRole } from '@/types/user';

interface ApplicationsDashboardProps {
  eventId: string;
  userRole?: UserRole;
}

export function ApplicationsDashboard({
  eventId,
  userRole,
}: Readonly<ApplicationsDashboardProps>) {
  const [activeStatus, setActiveStatus] = useState<RegistrationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null);

  const pageSize = 10;

  // Fetch event data for schema and title
  const { data: event } = useEvent(eventId);

  // Fetch registrations
  const {
    data: registrationsData,
    isLoading,
    error,
    refetch,
  } = useRegistrations({
    eventId,
    status: activeStatus === 'all' ? undefined : activeStatus,
    page: currentPage,
    limit: pageSize,
    search: searchQuery || undefined,
  });

  // Fetch counts for tabs
  const { data: counts } = useRegistrationCounts(eventId);

  // Export mutation
  const exportMutation = useExportRegistrations();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchQuery]);

  const registrations = registrationsData?.registrations || [];
  const pagination = registrationsData?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const handleStatusChange = (status: RegistrationStatus | 'all') => {
    setActiveStatus(status);
  };

  const handleCardClick = (registrationId: string) => {
    setSelectedRegistrationId(registrationId);
  };

  const handleStatusUpdate = () => {
    refetch();
  };

  const handleExport = () => {
    exportMutation.mutate({
      eventId,
      status: activeStatus === 'all' ? undefined : activeStatus,
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Event Registrations</h2>
          <p className="text-muted-foreground">
            {event?.title || 'Loading...'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Status Filter Cards */}
      {counts && (
        <StatusFilterCards
          activeStatus={activeStatus}
          onStatusChange={handleStatusChange}
          counts={counts}
        />
      )}

      <Separator />

      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Applications Table */}
      <ApplicationsTable
        registrations={registrations}
        isLoading={isLoading}
        error={error}
        eventTitle={event?.title}
        userRole={userRole}
        onViewDetails={handleCardClick}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {registrations.length} of {pagination.total} registrations
              {activeStatus !== 'all' && ` (${activeStatus})`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal (wider with schema support) */}
      <ApplicationDetailModal
        registrationId={selectedRegistrationId}
        schema={event?.registrationFormSchema || null}
        eventTitle={event?.title}
        open={!!selectedRegistrationId}
        onOpenChange={(open) => !open && setSelectedRegistrationId(null)}
        userRole={userRole}
      />
    </div>
  );
}
