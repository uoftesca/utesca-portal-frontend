import { Home, Bell, Calendar, Users, BarChart3, Settings, UserCircle } from 'lucide-react';
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
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: Bell,
    component: AnnouncementsDashboard,
  },
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    component: EventsManagementDashboard,
  },
  {
    id: 'team-management',
    label: 'Team Management',
    icon: Users,
    component: TeamManagementDashboard,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    component: AnalyticsDashboard,
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: Settings,
    component: SystemSettingsDashboard,
  },
  {
    id: 'my-profile',
    label: 'My Profile',
    icon: UserCircle,
    component: MyProfileDashboard,
  },
];
