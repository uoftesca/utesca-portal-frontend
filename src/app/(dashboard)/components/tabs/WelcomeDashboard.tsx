import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types/team';

export function WelcomeDashboard({ user }: { user: User | null }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground pt-1">
            Welcome back! Here&apos;s an overview of your account.
          </p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Signed in as:{' '}
              <span className="font-medium text-foreground">
                {user?.email}
              </span>
            </p>
            {user && (
              <>
                <p className="text-sm text-muted-foreground">
                  Name:{' '}
                  <span className="font-medium text-foreground">
                    {user.preferredName || user.firstName}{' '}
                    {user.lastName}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Role:{' '}
                  <span className="font-medium text-foreground">
                    {user.displayRole}
                  </span>
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
