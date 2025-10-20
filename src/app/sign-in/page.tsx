'use client'

import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent to-[#2A3441] px-4">
      <SignInForm />
    </div>
  )
}
