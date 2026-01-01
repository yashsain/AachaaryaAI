/**
 * Middleware for Route Protection
 *
 * Handles:
 * - Authentication checks for protected routes
 * - Role-based access control (admin vs teacher)
 * - Session refresh
 * - Redirects for unauthorized access
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          response = NextResponse.next({
            request,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Add auth state to response for client sync (Phase 2.3)
  // BUGFIX: Use cookie instead of header so client can actually read it
  if (session) {
    const sessionId = session.access_token.substring(0, 20)
    response.cookies.set('auth-sync-state', sessionId, {
      path: '/',
      httpOnly: false, // Must be false so client JS can read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  } else {
    response.cookies.set('auth-sync-state', 'none', {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  const path = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/forgot-password', '/reset-password', '/set-password']
  const isPublicRoute = publicRoutes.some((route) => path === route || path.startsWith(route))

  // If accessing public route, allow
  if (isPublicRoute) {
    // Redirect to dashboard if already logged in and trying to access login
    if (session && (path === '/login' || path === '/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // Protected routes require authentication
  if (!session) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route))

  if (isAdminRoute) {
    // Check if user has admin role in JWT claims
    const role = session.user.app_metadata?.role

    if (role !== 'admin') {
      // Redirect non-admins to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // API routes protection
  if (path.startsWith('/api/')) {
    // Check for valid session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only API routes
    const adminApiRoutes = ['/api/admin']
    const isAdminApiRoute = adminApiRoutes.some((route) => path.startsWith(route))

    if (isAdminApiRoute) {
      const role = session.user.app_metadata?.role
      if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
