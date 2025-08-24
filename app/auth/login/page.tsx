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
      router.push('/dashboard/student')
    }
  }, [session, router])

  useEffect(() => {
    // Add password visibility toggle functionality
    const addPasswordToggle = () => {
      const passwordInputs = document.querySelectorAll('input[type="password"]')
      
      passwordInputs.forEach((input) => {
        if (input.parentElement && !input.parentElement.querySelector('.password-toggle')) {
          const container = input.parentElement
          container.style.position = 'relative'
          
          const toggleButton = document.createElement('button')
          toggleButton.type = 'button'
          toggleButton.className = 'password-toggle'
          toggleButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `
          toggleButton.style.cssText = `
            position: absolute;
            right: 8px;
            bottom: 12%;
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            z-index: 10;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: color 0.2s;
          `
          
          toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.color = '#374151'
          })
          
          toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.color = '#6b7280'
          })
          
          toggleButton.addEventListener('click', () => {
            const passwordInput = input as HTMLInputElement
            const isPassword = passwordInput.type === 'password'
            passwordInput.type = isPassword ? 'text' : 'password'
            toggleButton.innerHTML = isPassword ? `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ` : `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            `
          })
          
          container.appendChild(toggleButton)
        }
      })
    }

    // Run initially and on DOM changes
    addPasswordToggle()
    const observer = new MutationObserver(addPasswordToggle)
    observer.observe(document.body, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [])

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
