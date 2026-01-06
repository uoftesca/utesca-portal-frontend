import { TAB_CONFIG } from '../config/tab-config';
import type { User } from '@/types/team';
import type { UserRole } from '@/types/user';

interface DashboardTabContentProps {
  activeTab: string;
  user: User | null;
  userRole?: UserRole;
  onEventClick: (eventId: string) => void;
}

export function DashboardTabContent({
  activeTab,
  user,
  userRole,
  onEventClick,
}: DashboardTabContentProps) {
  // Find the tab configuration
  const tabConfig = TAB_CONFIG.find((tab) => tab.id === activeTab);

  // If no matching tab found, return null
  if (!tabConfig) {
    return null;
  }

  // Get the component from the configuration
  const TabComponent = tabConfig.component;

  // Render the tab component with appropriate props
  return (
    <TabComponent
      user={user}
      userRole={userRole}
      onEventClick={onEventClick}
    />
  );
}
