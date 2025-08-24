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
      console.log('Session detected:', session.user?.email)
      router.push('/dashboard/student')
    }
  }, [session, router])

  useEffect(() => {
    // Listen for auth state changes and errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully')
        // Update button to show redirecting state
        const loadingButtons = document.querySelectorAll('button[data-loading-enhanced="true"]') as NodeListOf<HTMLButtonElement>
        loadingButtons.forEach(btn => {
          if (btn.innerHTML.includes('Signing in')) {
            btn.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                <span>Redirecting...</span>
              </div>
            `
          }
        })
        router.push('/dashboard/student')
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  useEffect(() => {
    // Watch for error messages and reset button state
    const checkForErrors = () => {
      // Look for various error message selectors
      const errorSelectors = [
        '[role="alert"]',
        '.supabase-auth-ui_ui-message',
        '.supabase-auth-ui_ui-message_container',
        'div[data-supabase-auth-ui="message"]'
      ]
      
      let errorFound = false
      
      for (const selector of errorSelectors) {
        const errorElement = document.querySelector(selector)
        if (errorElement && errorElement.textContent?.toLowerCase().includes('invalid')) {
          errorFound = true
          break
        }
      }
      
      // Also check for any div containing "Invalid" text
      const allDivs = document.querySelectorAll('div')
      Array.from(allDivs).forEach(div => {
        if (div.textContent?.includes('Invalid login credentials')) {
          errorFound = true
        }
      })
      
      if (errorFound) {
        console.log('Login error detected, resetting button state')
        const loadingButtons = document.querySelectorAll('button[data-loading-enhanced="true"]') as NodeListOf<HTMLButtonElement>
        loadingButtons.forEach(btn => {
          if (btn.innerHTML.includes('Signing in') || btn.innerHTML.includes('Redirecting')) {
            btn.innerHTML = 'Sign In'
            btn.disabled = false
            btn.style.opacity = '1'
            btn.style.cursor = 'pointer'
          }
        })
      }
    }

    const observer = new MutationObserver(checkForErrors)
    observer.observe(document.body, { childList: true, subtree: true })
    
    // Also check immediately
    setTimeout(checkForErrors, 100)
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Add loading state to login button
    const addLoadingState = () => {
      const loginButtons = document.querySelectorAll('button[type="submit"]') as NodeListOf<HTMLButtonElement>
      
      loginButtons.forEach((button) => {
        if (!button.dataset.loadingEnhanced) {
          button.dataset.loadingEnhanced = 'true'
          
          button.addEventListener('click', async (e) => {
            // Don't prevent default - let Supabase handle the form submission
            
            // Store original button content
            const originalContent = button.innerHTML
            
            // Add loading state after a small delay to ensure form validation passes
            setTimeout(() => {
              button.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  <span>Signing in...</span>
                </div>
              `
              button.disabled = true
              button.style.opacity = '0.7'
              button.style.cursor = 'not-allowed'
              
              // Add CSS animation for spinner
              if (!document.getElementById('spinner-styles')) {
                const style = document.createElement('style')
                style.id = 'spinner-styles'
                style.textContent = `
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `
                document.head.appendChild(style)
              }
            }, 100)
            
            // Keep loading state persistent - don't reset automatically
            // Only reset if there's an actual error (which would be handled elsewhere)
          })
        }
      })
    }

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
    addLoadingState()
    addPasswordToggle()
    const observer = new MutationObserver(() => {
      addLoadingState()
      addPasswordToggle()
    })
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
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3001/auth/callback'}
          />
        </div>
      </div>
    </div>
  )
}
