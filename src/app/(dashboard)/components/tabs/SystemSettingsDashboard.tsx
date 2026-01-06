import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SystemSettingsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground pt-1">
            Configure portal settings and preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            System settings content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
