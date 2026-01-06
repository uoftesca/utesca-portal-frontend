import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import type { User } from '@/types/team';
import type { ReactNode } from 'react';

interface DashboardLayoutProps {
  user: User | null;
  activeTab: string;
  eventId: string | null;
  view: string | null;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function DashboardLayout({
  user,
  activeTab,
  eventId,
  view,
  onTabChange,
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar
        user={user}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <SidebarInset>
        <DashboardHeader
          activeTab={activeTab}
          eventId={eventId}
          view={view}
          onTabChange={onTabChange}
        />
        <div className="flex flex-1 flex-col gap-4 p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
