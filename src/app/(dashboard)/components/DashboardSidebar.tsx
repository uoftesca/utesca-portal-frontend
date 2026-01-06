import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronUp, LogOut } from 'lucide-react';
import { useSignOut } from '@/hooks/use-auth';
import { TAB_CONFIG } from '../config/tab-config';
import type { User } from '@/types/team';

interface DashboardSidebarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DashboardSidebar({
  user,
  activeTab,
  onTabChange,
}: DashboardSidebarProps) {
  const signOut = useSignOut();

  const handleSignOut = () => {
    signOut.mutate();
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-lg font-bold px-2 py-4">UTESCA Portal</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {TAB_CONFIG.map((tab) => {
                const Icon = tab.icon;
                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      onClick={() => onTabChange(tab.id)}
                      isActive={activeTab === tab.id}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto p-2">
                  <Avatar className="h-8 w-8 bg-blue-700">
                    <AvatarFallback className="bg-blue-700 text-white text-xs">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-xs font-medium">
                      {user
                        ? `${user.preferredName || user.firstName} ${user.lastName}`
                        : 'User'}
                    </span>
                    <span className="text-xs font-medium">
                      {user?.displayRole || 'Member'}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="min-w-0"
                style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
              >
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
