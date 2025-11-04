'use client';

/**
 * Team Members Table Component
 *
 * Displays list of team members with filtering by year and department
 */

import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import type { User, Department, DepartmentListResponse, YearsResponse, UserListResponse, UserRole } from '@/types/team';

interface TeamMembersTableProps {
  refreshTrigger?: number;
  currentUserRole?: UserRole;
}

export function TeamMembersTable({ refreshTrigger, currentUserRole }: Readonly<TeamMembersTableProps>) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [deleteDialogUser, setDeleteDialogUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogUser, setEditDialogUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadDepartmentsAndYears();
  }, []);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, selectedYear, selectedDepartment, searchQuery, currentPage]);

  const loadDepartmentsAndYears = async () => {
    try {
      const [deptResponse, yearsResponse] = await Promise.all([
        apiClient.getDepartments({ all: true }),
        apiClient.getAvailableYears(),
      ]) as [DepartmentListResponse, YearsResponse];

      setDepartments(deptResponse.departments || []);
      setYears(yearsResponse.years || []);
    } catch (err) {
      console.error('Failed to load departments and years:', err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: {
        department_id?: string;
        year?: number;
        search?: string;
        page: number;
        page_size: number;
      } = {
        page: currentPage,
        page_size: pageSize,
      };

      if (selectedDepartment !== 'all') {
        if (selectedDepartment === 'none') {
          // Handle "Executive Board" (no department) filter
          // This would require backend support - for now skip
        } else {
          params.department_id = selectedDepartment;
        }
      }

      if (selectedYear !== 'all') {
        params.year = Number.parseInt(selectedYear, 10);
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await apiClient.getUsers(params) as UserListResponse;

      setUsers(response.users || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
      setTotal(0);
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
        return 'Co-President';
      case 'vp':
        return 'VP';
      case 'director':
        return 'Director';
      default:
        return role;
    }
  };

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return 'No Department';
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.name || 'Unknown';
  };

  const getDepartmentYear = (departmentId: string | null) => {
    if (!departmentId) return '-';
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.year?.toString() || '-';
  };

  const totalPages = Math.ceil(total / pageSize);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  };

  const handleEditUser = (user: User) => {
    setEditDialogUser(user);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedUser: User) => {
    // Update the user in local state instead of re-fetching
    setUsers(prevUsers =>
      prevUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );
    setEditDialogOpen(false);
    setEditDialogUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteDialogUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    if (deleteDialogUser) {
      // Remove the deleted user from local state instead of re-fetching
      setUsers(prevUsers => prevUsers.filter(u => u.id !== deleteDialogUser.id));
      setTotal(prevTotal => prevTotal - 1);
    }
    setDeleteDialogOpen(false);
    setDeleteDialogUser(null);
  };

  if (loading && users.length === 0) {
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedYear} onValueChange={handleYearChange}>
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
        <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
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
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No members found matching your filters
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length > 0 && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.preferred_name ? `${user.preferred_name} ${user.last_name}` : `${user.first_name} ${user.last_name}`}
                </TableCell>
                <TableCell>{user.display_role}</TableCell>
                <TableCell>{getDepartmentName(user.department_id)}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{getDepartmentYear(user.department_id)}</TableCell>
                <TableCell>
                  {(currentUserRole === 'co_president' || currentUserRole === 'vp') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {users.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, total)} of {total} members
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Member Dialog */}
      {editDialogUser && currentUserRole && (
        <EditMemberDialog
          user={editDialogUser}
          currentUserRole={currentUserRole}
          onSuccess={handleEditSuccess}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditDialogUser(null);
            }
          }}
        />
      )}

      {/* Delete Member Dialog */}
      {deleteDialogUser && (
        <DeleteMemberDialog
          user={deleteDialogUser}
          onSuccess={handleDeleteSuccess}
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) {
              setDeleteDialogUser(null);
            }
          }}
        />
      )}
    </div>
  );
}
