import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for NextAuth session cookie (Auth.js v5 uses these cookie names)
  const hasSession =
    request.cookies.has('authjs.session-token') ||
    request.cookies.has('__Secure-authjs.session-token')

  const isPersonalized = request.cookies.get('takecare-personalized')?.value === 'true'

  // 1. Protect /dashboard — must be signed in
  if (pathname.startsWith('/dashboard')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/signin', request.url))
    }
    // If signed in but NOT personalized, send to onboarding
    if (!isPersonalized) {
      return NextResponse.redirect(new URL('/personalization-choice', request.url))
    }
  }

  // 2. If user is signed in + personalized and visits home or auth pages, redirect to dashboard
  const authPages = ['/', '/signin', '/signup', '/personalization-choice', '/personalization-onboarding']
  if (authPages.includes(pathname) && hasSession && isPersonalized) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. If user is on auth pages (signin/signup) but already signed in (not personalized), let them through
  //    to /personalization-choice and /personalization-onboarding
  if (['/signin', '/signup'].includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL('/personalization-choice', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - onboarding (allow access to onboarding pages)
     * - images, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|onboarding|images|public).*)',
  ],
}
