'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { useUser } from '@supabase/auth-helpers-react'
import { Navbar } from '@/components/layout/Navbar'
import { ArrowLeft, Search, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { University as UniversityType, ApplicationType } from '@/types/database'

export default function NewApplicationPage() {
  const [universities, setUniversities] = useState<UniversityType[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<UniversityType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState<UniversityType | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    application_type: 'regular_decision' as ApplicationType,
    intended_major: '',
    deadline: '',
    financial_aid_requested: false,
    scholarship_applied: false,
    notes: '',
    priority_level: 3,
  })

  const supabase = createClientSupabase()
  const user = useUser()
  const router = useRouter()

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase
        .from('universities')
        .select('*')
        .order('name')
      
      if (data) {
        setUniversities(data)
        setFilteredUniversities(data)
      }
    }

    fetchUniversities()
  }, [supabase])

  // Filter universities based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.state?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUniversities(filtered)
    } else {
      setFilteredUniversities(universities)
    }
  }, [searchTerm, universities])

  // Set deadline based on application type and university
  useEffect(() => {
    if (selectedUniversity && selectedUniversity.deadlines) {
      const deadlines = selectedUniversity.deadlines as any
      let deadline = ''
      
      switch (formData.application_type) {
        case 'early_decision':
          deadline = deadlines.early_decision || ''
          break
        case 'early_action':
          deadline = deadlines.early_action || ''
          break
        case 'regular_decision':
          deadline = deadlines.regular || ''
          break
        case 'rolling_admission':
          deadline = deadlines.rolling || ''
          break
      }
      
      setFormData(prev => ({ ...prev, deadline }))
    }
  }, [selectedUniversity, formData.application_type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedUniversity) return

    setLoading(true)

    try {
      // Get student ID
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!student) throw new Error('Student profile not found')

      // Create application
      const { error } = await supabase
        .from('applications')
        .insert({
          student_id: student.id,
          university_id: selectedUniversity.id,
          application_type: formData.application_type,
          intended_major: formData.intended_major || null,
          deadline: formData.deadline,
          financial_aid_requested: formData.financial_aid_requested,
          scholarship_applied: formData.scholarship_applied,
          notes: formData.notes || null,
          priority_level: formData.priority_level,
        })

      if (error) throw error

      router.push('/dashboard/student')
    } catch (error) {
      console.error('Error creating application:', error)
      alert('Error creating application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student" className="flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Application</h1>
          <p className="text-gray-600 mt-2">Search for a university and create your application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* University Search */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select University</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search universities..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* University List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUniversities.map((university) => (
                <div
                  key={university.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedUniversity?.id === university.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUniversity(university)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{university.name}</h3>
                      <p className="text-sm text-gray-600">
                        {university.city}, {university.state}
                      </p>
                      {university.us_news_ranking && (
                        <p className="text-xs text-gray-500">
                          Ranking: #{university.us_news_ranking}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {university.acceptance_rate && (
                        <p>{university.acceptance_rate}% acceptance</p>
                      )}
                      {university.application_fee && (
                        <p>${university.application_fee} fee</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
            
            {selectedUniversity ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {selectedUniversity.name}
                  </h3>

                  <div className="space-y-4">
                    {/* Application Type */}
                    <div>
                      <label className="label">Application Type *</label>
                      <select
                        required
                        className="input"
                        value={formData.application_type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          application_type: e.target.value as ApplicationType 
                        }))}
                      >
                        <option value="early_decision">Early Decision</option>
                        <option value="early_action">Early Action</option>
                        <option value="regular_decision">Regular Decision</option>
                        <option value="rolling_admission">Rolling Admission</option>
                      </select>
                    </div>

                    {/* Intended Major */}
                    <div>
                      <label className="label">Intended Major</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g., Computer Science"
                        value={formData.intended_major}
                        onChange={(e) => setFormData(prev => ({ ...prev, intended_major: e.target.value }))}
                      />
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="label">Application Deadline *</label>
                      <input
                        type="date"
                        required
                        className="input"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>

                    {/* Priority Level */}
                    <div>
                      <label className="label">Priority Level</label>
                      <select
                        className="input"
                        value={formData.priority_level}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          priority_level: parseInt(e.target.value) 
                        }))}
                      >
                        <option value={1}>1 - Highest Priority</option>
                        <option value={2}>2 - High Priority</option>
                        <option value={3}>3 - Medium Priority</option>
                        <option value={4}>4 - Low Priority</option>
                        <option value={5}>5 - Lowest Priority</option>
                      </select>
                    </div>

                    {/* Financial Aid */}
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.financial_aid_requested}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            financial_aid_requested: e.target.checked 
                          }))}
                        />
                        <span className="text-sm">Request Financial Aid</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={formData.scholarship_applied}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            scholarship_applied: e.target.checked 
                          }))}
                        />
                        <span className="text-sm">Apply for Scholarships</span>
                      </label>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="label">Notes</label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Any additional notes about this application..."
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    {/* University Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">University Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {selectedUniversity.application_system && (
                          <p>Application System: {selectedUniversity.application_system}</p>
                        )}
                        {selectedUniversity.application_fee && (
                          <p>Application Fee: ${selectedUniversity.application_fee}</p>
                        )}
                        {selectedUniversity.tuition_out_state && (
                          <p>Estimated Tuition: ${selectedUniversity.tuition_out_state.toLocaleString()}/year</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary mt-6"
                  >
                    {loading ? 'Creating Application...' : 'Create Application'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="card text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a University</h3>
                <p className="text-gray-600">Choose a university from the list to create your application</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
