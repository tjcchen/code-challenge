import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not signed in and the current path is not auth related, redirect to login
  if (!user && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // If user is signed in, check if they have completed setup
  if (user) {
    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // Check if user has a role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    // Also check if user has student data (fallback)
    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single()

    // User has completed setup if they have profile AND (role OR student data)
    const hasCompletedSetup = profile && (userRole || studentData)
    
    // Debug logging (remove in production)
    console.log('Middleware debug:', {
      userId: user.id,
      hasProfile: !!profile,
      hasRole: !!userRole,
      hasStudentData: !!studentData,
      hasCompletedSetup,
      profileError,
      roleError
    })

    // If setup is complete and trying to access setup page, redirect to dashboard
    if (hasCompletedSetup && req.nextUrl.pathname === '/auth/setup') {
      if (userRole?.role === 'student' || studentData) {
        return NextResponse.redirect(new URL('/dashboard/student', req.url))
      } else if (userRole?.role === 'parent') {
        return NextResponse.redirect(new URL('/dashboard/parent', req.url))
      }
    }

    // If setup is not complete and trying to access dashboard, redirect to setup
    if (!hasCompletedSetup && req.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/auth/setup', req.url))
    }

    // If user is signed in and trying to access other auth pages (login), redirect based on setup status
    if (req.nextUrl.pathname.startsWith('/auth/login') || req.nextUrl.pathname.startsWith('/auth/callback')) {
      if (hasCompletedSetup) {
        if (userRole?.role === 'student' || studentData) {
          return NextResponse.redirect(new URL('/dashboard/student', req.url))
        } else if (userRole?.role === 'parent') {
          return NextResponse.redirect(new URL('/dashboard/parent', req.url))
        }
      } else {
        return NextResponse.redirect(new URL('/auth/setup', req.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
