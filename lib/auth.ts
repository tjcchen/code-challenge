import { createServerSupabase } from './supabase-server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database'

export async function getUser() {
  const supabase = createServerSupabase()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getUserProfile() {
  const supabase = createServerSupabase()
  const user = await getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function getUserRoles(): Promise<UserRole[]> {
  const supabase = createServerSupabase()
  const user = await getUser()
  
  if (!user) return []

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  console.log('User roles query:', { userId: user.id, roles, error })
  return roles?.map(r => r.role) || []
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/auth/login')
  }
  return user
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  const roles = await getUserRoles()
  
  if (!roles.includes(requiredRole)) {
    redirect('/unauthorized')
  }
  
  return user
}

export async function getStudentProfile() {
  const supabase = createServerSupabase()
  const user = await requireAuth()
  
  // Check if user has student role OR if student record exists
  const roles = await getUserRoles()
  const { data: student } = await supabase
    .from('students')
    .select(`
      *,
      profile:profiles(*)
    `)
    .eq('user_id', user.id)
    .single()

  // If no role found but student record exists, allow access
  if (!roles.includes('student') && !student) {
    redirect('/unauthorized')
  }

  return student
}

export async function getParentChildren() {
  const supabase = createServerSupabase()
  const user = await requireRole('parent')
  
  const { data: children } = await supabase
    .from('parent_student_relationships')
    .select(`
      student:students(
        *,
        profile:profiles(*)
      )
    `)
    .eq('parent_id', user.id)

  return children?.map(c => c.student) || []
}
