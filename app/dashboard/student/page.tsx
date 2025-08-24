import { getStudentProfile } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Calendar, Clock, Plus, TrendingUp, GraduationCap, Building2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const student = await getStudentProfile()
  const supabase = createServerSupabase()

  // Fetch applications with university data
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      *,
      university:universities(*),
      requirements:application_requirements(*)
    `)
    .eq('student_id', student.id)
    .order('deadline', { ascending: true })

  // Calculate stats
  const totalApplications = applications?.length || 0
  const submittedApplications = applications?.filter(app => 
    ['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred'].includes(app.status)
  ).length || 0
  const acceptedApplications = applications?.filter(app => app.status === 'accepted').length || 0
  const upcomingDeadlines = applications?.filter(app => {
    const deadline = new Date(app.deadline)
    const now = new Date()
    const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 30 && daysUntil >= 0 && !['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred'].includes(app.status)
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {student.profile?.full_name}
          </h1>
          <p className="text-gray-600 mt-2">
            Class of {student.graduation_year} • {student.intended_majors.join(', ') || 'Undecided'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{submittedApplications}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-gray-900">{acceptedApplications}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <Clock className="h-6 w-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <Link href="/dashboard/student/applications/new" className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Link>
            </div>

            <div className="space-y-6 grid grid-cols-1 gap-1">
              {applications?.map((application) => (
                <Link key={application.id} href={`/dashboard/student/applications/${application.id}`}>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-6">
                        <div className="flex items-center mb-3">
                          <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {application.university.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {application.application_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • 
                          {application.intended_major || 'Undecided'}
                        </p>
                        <div className="flex items-center space-x-4">
                          <StatusBadge status={application.status} />
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(application.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {application.requirements?.filter((req: any) => req.status === 'completed').length || 0}/
                          {application.requirements?.length || 0} requirements
                        </p>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${application.requirements?.length ? 
                                (application.requirements.filter((req: any) => req.status === 'completed').length / application.requirements.length) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {application.requirements?.length ? 
                            Math.round((application.requirements.filter((req: any) => req.status === 'completed').length / application.requirements.length) * 100) : 0}% complete
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )) || (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first university application</p>
                  <Link href="/dashboard/student/applications/new" className="btn-primary">
                    Add Your First Application
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines Sidebar */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Deadlines</h2>
            
            <div className="space-y-4">
              {upcomingDeadlines.slice(0, 5).map((application) => {
                const deadline = new Date(application.deadline)
                const now = new Date()
                const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={application.id} className="card">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {application.university.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {deadline.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        daysUntil <= 7 ? 'bg-danger-100 text-danger-800' :
                        daysUntil <= 14 ? 'bg-warning-100 text-warning-800' :
                        'bg-primary-100 text-primary-800'
                      }`}>
                        {daysUntil} days
                      </span>
                    </div>
                  </div>
                )
              })}
              
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No upcoming deadlines</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
