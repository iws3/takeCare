import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const clerkId = request.cookies.get('takecare-clerk-id')?.value
  const personalized = request.cookies.get('takecare-personalized')?.value === 'true'
  const { pathname } = request.nextUrl
 
  // 1. If trying to access dashboard but no clerkId, redirect to home
  if (pathname.startsWith('/dashboard') && !clerkId) {
    return NextResponse.redirect(new URL('/', request.url))
  }
 
  // 2. If trying to access dashboard but NOT personalized, redirect to ONBOARDING
  if (pathname.startsWith('/dashboard') && !personalized) {
    return NextResponse.redirect(new URL('/onboarding/personalize', request.url))
  }
 
  // 3. If at home but ALREADY personalized, redirect to dashboard
  if (pathname === '/' && clerkId && personalized) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
     * - onboarding/personalize (allow access to personalize)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
