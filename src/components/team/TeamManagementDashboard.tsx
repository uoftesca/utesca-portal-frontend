'use client';

/**
 * Team Management Dashboard Component
 *
 * Main dashboard for managing executive team members
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardMemberDialog } from './OnboardMemberDialog';
import { TeamMembersTable } from './TeamMembersTable';

interface TeamManagementDashboardProps {
  readonly userRole?: string;
}

export function TeamManagementDashboard({ userRole }: TeamManagementDashboardProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isCoPresident = userRole === 'co_president';

  const handleInviteSuccess = () => {
    // Refresh the table
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground pt-1">
            Manage your executive team members and their roles
          </p>
        </div>
        {isCoPresident && <OnboardMemberDialog onSuccess={handleInviteSuccess} />}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            View and manage all executive team members across departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMembersTable refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  );
}
