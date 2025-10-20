'use client';

/**
 * Team Members Table Component
 *
 * Displays list of team members with filtering by year and department
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import type { User, Department, DepartmentListResponse, YearsResponse } from '@/types/team';

// Mock data for now - will be replaced with API call
const mockUsers: User[] = [
  {
    id: '1',
    user_id: '1',
    email: 'sarah.johnson@example.com',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'co_president',
    display_role: 'President',
    department_id: null,
    preferred_name: null,
    photo_url: null,
    invited_by: null,
    announcement_email_preference: 'all',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '2',
    email: 'michael.chen@example.com',
    first_name: 'Michael',
    last_name: 'Chen',
    role: 'co_president',
    display_role: 'Vice President',
    department_id: null,
    preferred_name: null,
    photo_url: null,
    invited_by: null,
    announcement_email_preference: 'all',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

interface TeamMembersTableProps {
  refreshTrigger?: number;
}

export function TeamMembersTable({ refreshTrigger }: TeamMembersTableProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load departments and years
      const [deptResponse, yearsResponse] = await Promise.all([
        apiClient.getDepartments({ all: true }),
        apiClient.getAvailableYears(),
      ]) as [DepartmentListResponse, YearsResponse];

      setDepartments(deptResponse.departments || []);
      setYears(yearsResponse.years || []);

      // TODO: Replace with actual API call when users endpoint is ready
      setUsers(mockUsers);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'co_president':
        return 'destructive';
      case 'vp':
        return 'default';
      case 'director':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'co_president':
        return 'Admin';
      case 'vp':
        return 'Editor';
      case 'director':
        return 'Contributor';
      default:
        return role;
    }
  };

  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Year filter - TODO: implement when user.year is available
    const matchesYear = selectedYear === 'all';

    // Department filter
    const matchesDepartment =
      selectedDepartment === 'all' ||
      (selectedDepartment === 'none' && !user.department_id) ||
      user.department_id === selectedDepartment;

    return matchesSearch && matchesYear && matchesDepartment;
  });

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return 'No Department';
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
            <SelectItem value="none">No Department</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Permission</TableHead>
              <TableHead className="text-right">Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No members found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.display_role}</TableCell>
                  <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">2024</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} members
      </p>
    </div>
  );
}
