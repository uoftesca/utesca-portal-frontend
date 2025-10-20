'use client';

/**
 * Onboard Member Dialog Component
 *
 * Dialog for co-presidents to invite new team members
 */

import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import type { Department, InviteUserRequest, UserRole } from '@/types/team';

interface OnboardMemberDialogProps {
  onSuccess?: () => void;
}

export function OnboardMemberDialog({ onSuccess }: OnboardMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState<InviteUserRequest>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'director',
    display_role: '',
    department_id: undefined,
  });
  const [error, setError] = useState<string | null>(null);

  // Load departments when dialog opens
  useEffect(() => {
    if (open) {
      loadDepartments();
    }
  }, [open]);

  const loadDepartments = async () => {
    try {
      const response: any = await apiClient.getDepartments({ all: false });
      setDepartments(response.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
      setError('Failed to load departments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.inviteUser(formData);

      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'director',
        display_role: '',
        department_id: undefined,
      });

      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to invite user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Onboard New Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Onboard New Member</DialogTitle>
            <DialogDescription>
              Invite a new team member to the UTESCA Portal. They will receive
              an email invitation to set their password.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                  placeholder="John"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role Permission</Label>
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
              <p className="text-xs text-muted-foreground">
                Determines system permissions and access level
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_role">Display Role</Label>
              <Input
                id="display_role"
                value={formData.display_role}
                onChange={(e) =>
                  setFormData({ ...formData, display_role: e.target.value })
                }
                required
                placeholder="e.g., VP of Events, Marketing Director"
              />
              <p className="text-xs text-muted-foreground">
                Public-facing role title shown on the website
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, department_id: value })
                }
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
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
            </div>
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
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
