'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TeamManagementDashboard } from '@/components/team';
import { EventsManagementDashboard, EventDetailsDialog } from '@/components/events';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/user';
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
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'team-management', label: 'Team Management', icon: Users },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'applications', label: 'Applications', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'system-settings', label: 'System Settings', icon: Settings },
  { id: 'my-profile', label: 'My Profile', icon: UserCircle },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get event ID from URL query params
  const eventId = searchParams.get('event');

  useEffect(() => {
    const getUser = async () => {
      try {
        // Get auth user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Fetch complete user profile from backend
        if (user) {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.access_token) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );

            if (response.ok) {
              const profile = await response.json();
              setUserProfile(profile);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
    router.refresh();
  };

  // Handle opening event modal by adding event ID to URL
  const handleEventClick = (eventId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('event', eventId);
    router.push(`/?${params.toString()}`);
  };

  // Handle closing event modal by removing event ID from URL
  const handleEventModalClose = (open: boolean) => {
    if (!open) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('event');
      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : '/');
    }
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
                    {userProfile?.email || user?.email}
                  </span>
                </p>
                {userProfile && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Name:{' '}
                      <span className="font-medium text-foreground">
                        {userProfile.preferredName || userProfile.firstName}{' '}
                        {userProfile.lastName}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Role:{' '}
                      <span className="font-medium text-foreground">
                        {userProfile.displayRole}
                      </span>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 'events':
        return (
          <EventsManagementDashboard
            userRole={userProfile?.role}
            onEventClick={handleEventClick}
          />
        );
      case 'team-management':
        return (
          <TeamManagementDashboard userRole={userProfile?.role} />
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
                        {userProfile?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start flex-1">
                      <span className="text-xs font-medium">
                        {userProfile
                          ? `${userProfile.preferredName || userProfile.firstName} ${userProfile.lastName}`
                          : 'User'}
                      </span>
                      <span className="text-xs font-medium">
                        {userProfile?.displayRole || 'Member'}
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
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab('dashboard');
                  }}
                  className="cursor-pointer hover:text-foreground"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              {activeTab !== 'dashboard' && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {menuItems.find((item) => item.id === activeTab)?.label}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-8">
          {renderTabContent()}
        </div>
      </SidebarInset>

      {/* Event Details Dialog - controlled by URL */}
      <EventDetailsDialog
        eventId={eventId}
        userRole={userProfile?.role}
        open={!!eventId}
        onOpenChange={handleEventModalClose}
        onSuccess={() => {
          // Events will automatically refresh via React Query cache invalidation
          handleEventModalClose(false);
        }}
      />
    </SidebarProvider>
  );
}
