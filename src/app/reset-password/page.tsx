'use client'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent to-[#2A3441] px-4">
      <ResetPasswordForm />
    </div>
  )
}
