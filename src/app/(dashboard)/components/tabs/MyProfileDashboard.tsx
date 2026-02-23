'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { useAuth } from '@/hooks/use-auth';
import { useUpdateUser } from '@/hooks/use-users';
import { apiClient } from '@/lib/api-client';

export function MyProfileDashboard() {
  const { user, isLoading } = useAuth();
  const updateUserMutation = useUpdateUser();

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    preferred_name: '',
    profile_picture_url: '',
    linkedin_url: '',
    email_notifications: true,
  });

  const [password, setPassword] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // 🔁 Load user data into form when fetched
  useEffect(() => {
    if (user) {
      setProfile({
        preferred_name: user.preferred_name || '',
        profile_picture_url: user.profile_picture_url || '',
        linkedin_url: user.linkedin_url || '',
        email_notifications: user.notification_preferences?.email ?? true,
      });
    }
  }, [user]);

  // ---------------- Save profile ----------------
  const handleSaveProfile = () => {
    if (!user) return;

    updateUserMutation.mutate({
      userId: user.id,
      data: {
        preferred_name: profile.preferred_name,
        profile_picture_url: profile.profile_picture_url,
        linkedin_url: profile.linkedin_url,
        notification_preferences: {
          email: profile.email_notifications,
        },
      },
    });

    setIsEditing(false);
  };

  // ---------------- Change password ----------------
  const handleChangePassword = async () => {
    if (password.new_password !== password.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    try {
      await apiClient.changePassword({
        current_password: password.current_password,
        new_password: password.new_password,
      });

      alert('Password changed successfully!');
      setPassword({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error(err);
      alert('Error changing password');
    }
  };

  // ---------------- Loading ----------------
  if (isLoading) {
    return <div className="p-6">Loading profile...</div>;
  }

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <Button onClick={handleSaveProfile}>
            {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>

      {/* ---------------- PROFILE CARD ---------------- */}
      <Card>
        <CardContent className="space-y-6">

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback>
                {profile.preferred_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={profile.preferred_name}
                  onChange={(e) =>
                    setProfile({ ...profile, preferred_name: e.target.value })
                  }
                />
              ) : (
                <h2 className="text-xl font-semibold">
                  {profile.preferred_name || '—'}
                </h2>
              )}
              <p className="text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          {/* LinkedIn */}
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-muted-foreground">LinkedIn</span>

            {isEditing ? (
              <Input
                placeholder="https://linkedin.com/in/..."
                value={profile.linkedin_url}
                onChange={(e) =>
                  setProfile({ ...profile, linkedin_url: e.target.value })
                }
              />
            ) : (
              <span>{profile.linkedin_url || '—'}</span>
            )}
          </div>

          {/* Email Notifications */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Email Notifications
            </span>

            {isEditing ? (
              <input
                type="checkbox"
                checked={profile.email_notifications}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    email_notifications: e.target.checked,
                  })
                }
              />
            ) : (
              <span>
                {profile.email_notifications ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

        </CardContent>
      </Card>

      {/* ---------------- PASSWORD SECTION ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Current Password"
            value={password.current_password}
            onChange={(e) =>
              setPassword({ ...password, current_password: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="New Password"
            value={password.new_password}
            onChange={(e) =>
              setPassword({ ...password, new_password: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            value={password.confirm_password}
            onChange={(e) =>
              setPassword({ ...password, confirm_password: e.target.value })
            }
          />

          <Button onClick={handleChangePassword}>
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}