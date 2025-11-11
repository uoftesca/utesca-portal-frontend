'use client';

/**
 * Edit Member Dialog Component
 *
 * Dialog for editing existing team member information
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldLabel, FieldDescription } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import type { User, Department, DepartmentListResponse, UserRole, UpdateUserRequest } from '@/types/team';

interface EditMemberDialogProps {
  user: User;
  currentUserRole: UserRole;
  onSuccess?: (updatedUser: User) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function EditMemberDialog({
  user,
  currentUserRole,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
  children
}: Readonly<EditMemberDialogProps>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    displayRole: user.displayRole,
    role: user.role,
    departmentId: user.departmentId || 'none',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;

  // Determine what the current user can edit
  const isCoPresident = currentUserRole === 'co_president';
  const canEditRole = isCoPresident && user.role !== 'co_president';
  const canEditDepartment = isCoPresident;

  // Load departments when dialog opens
  useEffect(() => {
    if (open) {
      loadDepartments();
      // Reset form data when opening
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        displayRole: user.displayRole,
        role: user.role,
        departmentId: user.departmentId || 'none',
      });
      setErrors({});
      setError(null);
    }
  }, [open, user]);

  const loadDepartments = async () => {
    try {
      const response = await apiClient.getDepartments({ all: false }) as DepartmentListResponse;
      setDepartments(response.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError('Failed to load departments');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length > 100) {
      newErrors.firstName = 'First name must be 100 characters or less';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length > 100) {
      newErrors.lastName = 'Last name must be 100 characters or less';
    }

    if (!formData.displayRole.trim()) {
      newErrors.displayRole = 'Display role is required';
    } else if (formData.displayRole.length > 255) {
      newErrors.displayRole = 'Display role must be 255 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Build update request with only changed fields
      const updateData: UpdateUserRequest = {};

      if (formData.firstName !== user.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== user.lastName) {
        updateData.lastName = formData.lastName;
      }
      if (formData.displayRole !== user.displayRole) {
        updateData.displayRole = formData.displayRole;
      }
      if (canEditRole && formData.role !== user.role) {
        updateData.role = formData.role;
      }
      if (canEditDepartment) {
        const newDeptId = formData.departmentId === 'none' ? undefined : formData.departmentId;
        const currentDeptId = user.departmentId || undefined;
        if (newDeptId !== currentDeptId) {
          updateData.departmentId = newDeptId;
        }
      }

      // Check if anything changed
      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const updatedUser = await apiClient.updateUser(user.id, updateData) as User;

      setOpen(false);
      onSuccess?.(updatedUser);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user.preferredName
    ? `${user.firstName} (${user.preferredName}) ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update information for {displayName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  placeholder="John"
                />
                {errors.firstName && <FieldError>{errors.firstName}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
                {errors.lastName && <FieldError>{errors.lastName}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="displayRole">Display Role</FieldLabel>
              <Input
                id="displayRole"
                value={formData.displayRole}
                onChange={(e) =>
                  setFormData({ ...formData, displayRole: e.target.value })
                }
                placeholder="e.g., VP of Events, Marketing Director"
              />
              <FieldDescription>
                Public-facing role title shown on the website
              </FieldDescription>
              {errors.displayRole && <FieldError>{errors.displayRole}</FieldError>}
            </Field>

            {canEditRole && (
              <Field>
                <FieldLabel htmlFor="role">Role Permission</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co_president">Co-President</SelectItem>
                    <SelectItem value="vp">Vice President</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Determines system permissions and access level
                </FieldDescription>
              </Field>
            )}

            {canEditDepartment && (
              <Field>
                <FieldLabel htmlFor="department">Department</FieldLabel>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: value })
                  }
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="No department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {!canEditRole && !canEditDepartment && (
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                As a VP, you can only edit names and display role for directors in your department.
              </div>
            )}

            {user.role === 'co_president' && (
              <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                Existing co-presidents cannot be demoted. However, you can promote others to co-president.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
