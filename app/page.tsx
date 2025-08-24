import { getUser, getUserRoles } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const roles = await getUserRoles()
  
  // Redirect based on user role
  if (roles.includes('student')) {
    redirect('/dashboard/student')
  } else if (roles.includes('parent')) {
    redirect('/dashboard/parent')
  } else {
    redirect('/auth/setup')
  }
}
