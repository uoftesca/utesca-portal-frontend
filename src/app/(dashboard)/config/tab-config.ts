import { Home, Bell, Calendar, Users, BarChart3, Settings, UserCircle, ScanIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { UserRole } from '@/types/user';
import type { User } from '@/types/team';

// Import tab components
import { WelcomeDashboard } from '../components/tabs/WelcomeDashboard';
import { AnnouncementsDashboard } from '../components/tabs/AnnouncementsDashboard';
import { AnalyticsDashboard } from '../components/tabs/AnalyticsDashboard';
import { SystemSettingsDashboard } from '../components/tabs/SystemSettingsDashboard';
import { MyProfileDashboard } from '../components/tabs/MyProfileDashboard';
import { EventsManagementDashboard } from '@/components/events';
import { TeamManagementDashboard } from '@/components/team';
import { CheckInDashboard } from '../components/tabs/CheckInDashboard';

/**
 * Props interface that all tab components must implement
 */
export interface TabComponentProps {
  user: User | null;
  userRole?: UserRole;
  onEventClick: (eventId: string) => void;
}

/**
 * Tab configuration interface
 */
export interface TabConfig {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  component: ComponentType<TabComponentProps>;
  needsPerms: boolean;
}

/**
 * Central configuration for all dashboard tabs
 *
 * To add a new tab:
 * 1. Create a new component implementing TabComponentProps
 * 2. Add an entry to this array
 * 3. No code changes needed in other files
 */
export const TAB_CONFIG: TabConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    component: WelcomeDashboard,
    needsPerms: false,
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: Bell,
    component: AnnouncementsDashboard,
    needsPerms: false,
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    component: EventsManagementDashboard,
    needsPerms: false,
  },
  {
    id: 'team-management',
    label: 'Team Management',
    icon: Users,
    component: TeamManagementDashboard,
    needsPerms: false,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: AnalyticsDashboard,
    needsPerms: false,
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    component: SystemSettingsDashboard,
    needsPerms: false,
  },
  {
    id: 'my-profile',
    label: 'My Profile',
    icon: UserCircle,
    component: MyProfileDashboard,
    needsPerms: false,
  },
  {
    id: 'check-in',
    label: 'Check-In',
    icon: ScanIcon,
    component: CheckInDashboard,
    needsPerms: true,
  }
];
