import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyProfileDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground pt-1">
            Manage your profile information and preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Profile content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
