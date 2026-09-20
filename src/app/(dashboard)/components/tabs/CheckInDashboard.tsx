import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckInScanner } from '@/components/events/CheckInScanner';

export function CheckInDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check-In</h1>
          <p className="text-muted-foreground pt-1">
            Scan event tickets here
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan a Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckInScanner></CheckInScanner>
        </CardContent>
      </Card>
    </div>
  )
}
