'use client';

/**
 * Team Management Dashboard Component
 *
 * Main dashboard for managing executive team members
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardMemberDialog } from './OnboardMemberDialog';
import { TeamMembersTable } from './TeamMembersTable';
import type { UserRole } from '@/types/user';

interface TeamManagementDashboardProps {
  readonly userRole?: UserRole;
}

export function TeamManagementDashboard({ userRole }: TeamManagementDashboardProps) {
  const isCoPresident = userRole === 'co_president';

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
        {isCoPresident && <OnboardMemberDialog />}
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
          <TeamMembersTable currentUserRole={userRole} />
        </CardContent>
      </Card>
    </div>
  );
}
