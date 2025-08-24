import { getParentChildren } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Calendar, Clock, DollarSign, TrendingUp, Building2, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ParentDashboard() {
  const children = await getParentChildren()
  const supabase = createServerSupabase()

  // Fetch applications for all children
  const childrenApplications = await Promise.all(
    children.map(async (child: any) => {
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          *,
          university:universities(*),
          requirements:application_requirements(*),
          notes:application_notes(*)
        `)
        .eq('student_id', child.id)
        .order('deadline', { ascending: true })

      return {
        child,
        applications: applications || []
      }
    })
  )

  // Calculate overall stats
  const totalApplications = childrenApplications.reduce((sum, child) => sum + child.applications.length, 0)
  const submittedApplications = childrenApplications.reduce((sum, child) => 
    sum + child.applications.filter(app => 
      ['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred'].includes(app.status)
    ).length, 0)
  const acceptedApplications = childrenApplications.reduce((sum, child) => 
    sum + child.applications.filter(app => app.status === 'accepted').length, 0)

  // Get upcoming deadlines across all children
  const allUpcomingDeadlines = childrenApplications.flatMap(({ child, applications }) =>
    applications
      .filter(app => {
        const deadline = new Date(app.deadline)
        const now = new Date()
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntil <= 30 && daysUntil >= 0 && !['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'deferred'].includes(app.status)
      })
      .map(app => ({ ...app, childName: child.profile?.full_name }))
  ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Parent Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your {children.length === 1 ? "child's" : "children's"} university application progress
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Building2 className="h-6 w-6 text-primary-600" />
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
                <p className="text-2xl font-bold text-gray-900">{allUpcomingDeadlines.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Children's Applications */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Applications by Child</h2>

            <div className="space-y-8">
              {childrenApplications.map(({ child, applications }: any) => (
                <div key={child.id} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {child.profile?.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Class of {child.graduation_year} • {applications.length} applications
                      </p>
                    </div>
                  </div>

                  {applications.length > 0 ? (
                    <div className="space-y-3 ml-10">
                      {applications.map((application: any) => (
                        <div key={application.id} className="card hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {application.university.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {application.application_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} • 
                                {application.intended_major || 'Undecided'}
                              </p>
                              <div className="flex items-center mt-2 space-x-4">
                                <StatusBadge status={application.status} />
                                <span className="text-sm text-gray-500">
                                  Due: {new Date(application.deadline).toLocaleDateString()}
                                </span>
                                {application.university.application_fee && (
                                  <span className="text-sm text-gray-500 flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    ${application.university.application_fee}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {application.requirements?.filter((req: any) => req.status === 'completed').length || 0}/
                                {application.requirements?.length || 0} requirements
                              </p>
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-primary-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${application.requirements?.length ? 
                                      (application.requirements.filter((req: any) => req.status === 'completed').length / application.requirements.length) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Financial Information */}
                          {application.university.tuition_out_state && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Estimated Tuition:</span>
                                <span className="font-medium text-gray-900">
                                  ${application.university.tuition_out_state?.toLocaleString()}/year
                                </span>
                              </div>
                              {application.financial_aid_requested && (
                                <div className="flex justify-between text-sm mt-1">
                                  <span className="text-gray-600">Financial Aid:</span>
                                  <span className="text-primary-600">Requested</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-10 text-center py-8 bg-gray-50 rounded-lg">
                      <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No applications yet</p>
                    </div>
                  )}
                </div>
              ))}

              {children.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No children linked</h3>
                  <p className="text-gray-600">Ask your child to add you as a parent in their profile</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines & Financial Summary */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming Deadlines</h2>
              
              <div className="space-y-4">
                {allUpcomingDeadlines.slice(0, 5).map((application) => {
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
                            {application.childName} • {deadline.toLocaleDateString()}
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
                
                {allUpcomingDeadlines.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Overview</h2>
              
              <div className="space-y-4">
                {childrenApplications.map(({ child, applications }) => {
                  const totalApplicationFees = applications.reduce((sum, app) => 
                    sum + (app.university.application_fee || 0), 0)
                  const estimatedTuition = applications
                    .filter(app => app.status === 'accepted')
                    .reduce((sum, app) => sum + (app.university.tuition_out_state || 0), 0)
                  
                  if (applications.length === 0) return null

                  return (
                    <div key={child.id} className="card">
                      <h3 className="font-medium text-gray-900 mb-3">{child.profile?.full_name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Application Fees:</span>
                          <span className="font-medium">${totalApplicationFees}</span>
                        </div>
                        {estimatedTuition > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Accepted Schools (Annual):</span>
                            <span className="font-medium">${estimatedTuition.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Financial Aid Requests:</span>
                          <span className="font-medium">
                            {applications.filter(app => app.financial_aid_requested).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
