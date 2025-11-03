/**
 * User profile type matching the backend /auth/me response
 */
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  preferred_name: string | null;
  role: string;
  display_role: string;
  department_id: string | null;
  photo_url: string | null;
  announcement_email_preference: string;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
}
