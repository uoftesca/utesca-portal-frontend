'use client';

/**
 * Team Members Table Component
 *
 * Displays list of team members with filtering by year and department
 */

import { useState, useMemo } from 'react';
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
import { useUsers, useDepartments, useAvailableYears } from '@/hooks/use-users';
import { DeleteMemberDialog } from '@/components/team/DeleteMemberDialog';
import { EditMemberDialog } from '@/components/team/EditMemberDialog';
import type { User, UserRole } from '@/types/team';

interface TeamMembersTableProps {
  currentUserRole?: UserRole;
}

export function TeamMembersTable({
  currentUserRole,
}: Readonly<TeamMembersTableProps>) {
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

  // Build query params for users
  const userParams = useMemo(() => {
    const params: {
      departmentId?: string;
      year?: number;
      search?: string;
      page: number;
      pageSize: number;
    } = {
      page: currentPage,
      pageSize: pageSize,
    };

    if (selectedDepartment !== 'all') {
      if (selectedDepartment === 'none') {
        // Handle "Executive Board" (no department) filter
        // This would require backend support - for now skip
      } else {
        params.departmentId = selectedDepartment;
      }
    }

    if (selectedYear !== 'all') {
      params.year = Number.parseInt(selectedYear, 10);
    }

    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [currentPage, selectedDepartment, selectedYear, searchQuery]);

  // Fetch data using React Query
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useUsers(userParams);

  const { data: departmentsData } = useDepartments({ all: true });
  const { data: yearsData } = useAvailableYears();

  const users = usersData?.users || [];
  const total = usersData?.total || 0;
  const departments = departmentsData?.departments || [];
  const years = yearsData?.years || [];
  const loading = isLoadingUsers;

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

  const handleEditSuccess = () => {
    // React Query will automatically refetch and update the cache
    setEditDialogOpen(false);
    setEditDialogUser(null);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteDialogUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    // React Query will automatically refetch and update the cache
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
            {usersError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md inline-block">
                    {usersError instanceof Error
                      ? usersError.message
                      : 'Failed to load members'}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && !usersError && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No members found matching your filters
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length > 0 && users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.preferredName ? `${user.preferredName} ${user.lastName}` : `${user.firstName} ${user.lastName}`}
                </TableCell>
                <TableCell>{user.displayRole}</TableCell>
                <TableCell>{getDepartmentName(user.departmentId)}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{getDepartmentYear(user.departmentId)}</TableCell>
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
