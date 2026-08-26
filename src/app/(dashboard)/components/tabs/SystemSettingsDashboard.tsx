import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export function SystemSettingsDashboard() {
  const [preferredName, setPreferredName] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground pt-1">
            Configure portal settings and preferences
          </p>
        </div>

        <Button>Save Changes</Button>
      </div>

      {/* ================= Profile Settings ================= */}
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* rows layout like Figma */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Preferred Name</Label>
              <Input
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Profile Picture (Google Drive link)</Label>
              <Input
                value={profilePicUrl}
                onChange={(e) => setProfilePicUrl(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Notification toggles */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border rounded-md p-3">
              <span>Email Notifications</span>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>

            <div className="flex justify-between items-center border rounded-md p-3">
              <span>SMS Notifications</span>
              <Switch checked={smsNotif} onCheckedChange={setSmsNotif} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ================= Change Password ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="md:col-span-3 flex justify-end">
            <Button>Change Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
