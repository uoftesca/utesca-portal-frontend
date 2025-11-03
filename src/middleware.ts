import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isSignInPage = request.nextUrl.pathname.startsWith('/sign-in')
  const isAcceptInvitePage = request.nextUrl.pathname.startsWith('/accept-invite')
  const isAuthPage = isSignInPage || isAcceptInvitePage

  // Redirect to home if authenticated and on sign-in page
  // (but allow access to accept-invite page even if authenticated)
  if (session && isSignInPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect to sign-in if not authenticated and not on auth page
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}