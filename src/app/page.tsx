'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@supabase/supabase-js';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Home,
  FileCheck,
  Calendar,
  Users,
  FileText,
  Image,
  Bell,
  BarChart3,
  Settings,
  UserCircle,
  ChevronUp,
  LogOut,
} from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'all-events', label: 'All Events', icon: Calendar },
  { id: 'team-management', label: 'Team Management', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'system-settings', label: 'System Settings', icon: Settings },
  { id: 'my-profile', label: 'My Profile', icon: UserCircle },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Signed in as:{' '}
                  <span className="font-medium text-foreground">
                    {user?.email}
                  </span>
                </p>
                {user?.user_metadata?.first_name && (
                  <p className="text-sm text-muted-foreground">
                    Name:{' '}
                    <span className="font-medium text-foreground">
                      {user.user_metadata.first_name}{' '}
                      {user.user_metadata.last_name}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 'all-events':
        return (
          <Card>
            <CardHeader>
              <CardTitle>All Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All events content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'team-management':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team management content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'applications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Applications content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'photos':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Photos content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'announcements':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Announcements content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'analytics':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'system-settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System settings content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      case 'my-profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Profile content will be displayed here.
              </p>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-bold px-2 py-4">UTESCA Portal</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.id)}
                        isActive={activeTab === item.id}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{item.label}</span>
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
                        {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-xs font-medium">
                        {user?.user_metadata?.first_name
                          ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                          : 'User'}
                      </span>
                      <span className="text-xs font-medium">
                        {user?.user_metadata?.display_role || 'Member'}
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">
            {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {renderTabContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
