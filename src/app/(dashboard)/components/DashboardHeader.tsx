import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { TAB_CONFIG } from '../config/tab-config';

interface DashboardHeaderProps {
  activeTab: string;
  eventId: string | null;
  view: string | null;
  onTabChange: (tabId: string) => void;
}

export function DashboardHeader({
  activeTab,
  eventId,
  view,
  onTabChange,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onTabChange('dashboard');
              }}
              className="cursor-pointer hover:text-foreground"
            >
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          {activeTab !== 'dashboard' && view !== 'applications' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {TAB_CONFIG.find((tab) => tab.id === activeTab)?.label}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
          {eventId && view === 'applications' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onTabChange('events');
                  }}
                  className="cursor-pointer hover:text-foreground"
                >
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Event Registrations</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
