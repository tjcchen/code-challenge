'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'

export default function LoginPage() {
  const supabase = createClientSupabase()
  const router = useRouter()
  const session = useSession()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          University Application Tracker
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your university applications
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback'}
          />
        </div>
      </div>
    </div>
  )
}
