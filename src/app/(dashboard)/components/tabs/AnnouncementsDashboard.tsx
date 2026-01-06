import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnnouncementsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground pt-1">
            View and manage club-wide announcements
          </p>
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Announcements content will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
