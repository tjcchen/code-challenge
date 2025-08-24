import { createServerSupabase } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerSupabase()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  // Redirect to login page so middleware can handle proper routing based on setup status
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}
