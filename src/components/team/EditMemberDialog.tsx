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
    first_name: user.first_name,
    last_name: user.last_name,
    display_role: user.display_role,
    role: user.role,
    department_id: user.department_id || 'none',
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
        first_name: user.first_name,
        last_name: user.last_name,
        display_role: user.display_role,
        role: user.role,
        department_id: user.department_id || 'none',
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

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length > 100) {
      newErrors.first_name = 'First name must be 100 characters or less';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length > 100) {
      newErrors.last_name = 'Last name must be 100 characters or less';
    }

    if (!formData.display_role.trim()) {
      newErrors.display_role = 'Display role is required';
    } else if (formData.display_role.length > 255) {
      newErrors.display_role = 'Display role must be 255 characters or less';
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

      if (formData.first_name !== user.first_name) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== user.last_name) {
        updateData.last_name = formData.last_name;
      }
      if (formData.display_role !== user.display_role) {
        updateData.display_role = formData.display_role;
      }
      if (canEditRole && formData.role !== user.role) {
        updateData.role = formData.role;
      }
      if (canEditDepartment) {
        const newDeptId = formData.department_id === 'none' ? undefined : formData.department_id;
        const currentDeptId = user.department_id || undefined;
        if (newDeptId !== currentDeptId) {
          updateData.department_id = newDeptId;
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

  const displayName = user.preferred_name
    ? `${user.first_name} (${user.preferred_name}) ${user.last_name}`
    : `${user.first_name} ${user.last_name}`;

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
                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  placeholder="John"
                />
                {errors.first_name && <FieldError>{errors.first_name}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  placeholder="Doe"
                />
                {errors.last_name && <FieldError>{errors.last_name}</FieldError>}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="display_role">Display Role</FieldLabel>
              <Input
                id="display_role"
                value={formData.display_role}
                onChange={(e) =>
                  setFormData({ ...formData, display_role: e.target.value })
                }
                placeholder="e.g., VP of Events, Marketing Director"
              />
              <FieldDescription>
                Public-facing role title shown on the website
              </FieldDescription>
              {errors.display_role && <FieldError>{errors.display_role}</FieldError>}
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
                  value={formData.department_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
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
