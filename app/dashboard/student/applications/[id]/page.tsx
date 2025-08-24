'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { StatusWorkflow } from '@/components/ui/StatusWorkflow'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ArrowLeft, Calendar, MapPin, GraduationCap, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase'
import type { ApplicationStatus } from '@/types/database'

interface Application {
  id: string
  status: ApplicationStatus
  deadline: string
  application_type: string
  intended_major: string
  university: {
    name: string
    location: string
    website: string
  }
  requirements: Array<{
    id: string
    name: string
    status: string
    due_date: string
  }>
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    fetchApplication()
  }, [params.id])

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          university:universities(*),
          requirements:application_requirements(*)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setApplication(data)
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    try {
      // Update the application status directly without triggering application_events
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Update local state
      setApplication(prev => prev ? { ...prev, status: newStatus } : null)
      
      console.log(`Status updated to: ${newStatus}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Not Found</h1>
            <Link href="/dashboard/student" className="btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const completedRequirements = application.requirements?.filter(req => req.status === 'completed').length || 0
  const totalRequirements = application.requirements?.length || 0
  const progressPercentage = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/student" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {application.university.name}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge status={application.status} />
                <span className="text-gray-600">
                  {application.application_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{application.intended_major}</span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(application.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* University Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">University Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{application.university.location}</span>
                </div>
                <div className="flex items-center">
                  <ExternalLink className="h-5 w-5 text-gray-400 mr-3" />
                  <a 
                    href={application.university.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit University Website
                  </a>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{application.intended_major}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">
                    Deadline: {new Date(application.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
                <div className="text-sm text-gray-600">
                  {completedRequirements}/{totalRequirements} completed
                </div>
              </div>
              
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {application.requirements?.map((requirement) => (
                  <div key={requirement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{requirement.name}</p>
                        {requirement.due_date && (
                          <p className="text-sm text-gray-500">
                            Due: {new Date(requirement.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={requirement.status as ApplicationStatus} />
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No requirements added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Status Workflow */}
          <div>
            <StatusWorkflow 
              currentStatus={application.status}
              applicationId={application.id}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
