'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { useUser } from '@supabase/auth-helpers-react'
import { Navbar } from '@/components/layout/Navbar'
import { ArrowLeft, Search, Building2, MapPin, Calendar, Star, Users, DollarSign, Clock, FileText, AlertCircle, Filter } from 'lucide-react'
import Link from 'next/link'
import type { University as UniversityType, ApplicationType } from '@/types/database'
import { ApplicationTimeline } from '@/components/ui/ApplicationTimeline'
import { ProgressVisualization } from '@/components/ui/ProgressVisualization'
import { RequirementsChecklist } from '@/components/ui/RequirementsChecklist'

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
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    ranking_min: '',
    ranking_max: '',
    acceptance_rate_min: '',
    acceptance_rate_max: '',
    tuition_max: '',
  })
  const [showFilters, setShowFilters] = useState(false)

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

  // Filter universities based on search and filters
  useEffect(() => {
    let filtered = universities

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.short_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        uni.state?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(uni => uni.country === filters.country)
    }
    if (filters.state) {
      filtered = filtered.filter(uni => uni.state === filters.state)
    }
    if (filters.ranking_min) {
      filtered = filtered.filter(uni => uni.us_news_ranking && uni.us_news_ranking >= parseInt(filters.ranking_min))
    }
    if (filters.ranking_max) {
      filtered = filtered.filter(uni => uni.us_news_ranking && uni.us_news_ranking <= parseInt(filters.ranking_max))
    }
    if (filters.acceptance_rate_min) {
      filtered = filtered.filter(uni => uni.acceptance_rate && uni.acceptance_rate >= parseFloat(filters.acceptance_rate_min))
    }
    if (filters.acceptance_rate_max) {
      filtered = filtered.filter(uni => uni.acceptance_rate && uni.acceptance_rate <= parseFloat(filters.acceptance_rate_max))
    }
    if (filters.tuition_max) {
      filtered = filtered.filter(uni => uni.tuition_out_state && uni.tuition_out_state <= parseInt(filters.tuition_max))
    }

    setFilteredUniversities(filtered)
  }, [searchTerm, universities, filters])

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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student" className="flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add New Application</h1>
          <p className="text-gray-600 mt-2">Search for a university and create your application with comprehensive tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* University Search & Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">大学搜索和选择</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  筛选
                </button>
              </div>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索大学名称、城市、州..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <h3 className="font-medium text-gray-900">高级筛选</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">国家</label>
                      <select
                        className="input text-sm"
                        value={filters.country}
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                      >
                        <option value="">所有国家</option>
                        <option value="United States">美国</option>
                        <option value="Canada">加拿大</option>
                        <option value="United Kingdom">英国</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">州</label>
                      <select
                        className="input text-sm"
                        value={filters.state}
                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                      >
                        <option value="">所有州</option>
                        <option value="California">加利福尼亚</option>
                        <option value="New York">纽约</option>
                        <option value="Massachusetts">马萨诸塞</option>
                        <option value="Pennsylvania">宾夕法尼亚</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">排名范围</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="最低"
                          className="input text-sm"
                          value={filters.ranking_min}
                          onChange={(e) => setFilters(prev => ({ ...prev, ranking_min: e.target.value }))}
                        />
                        <input
                          type="number"
                          placeholder="最高"
                          className="input text-sm"
                          value={filters.ranking_max}
                          onChange={(e) => setFilters(prev => ({ ...prev, ranking_max: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">录取率 (%)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="最低"
                          className="input text-sm"
                          value={filters.acceptance_rate_min}
                          onChange={(e) => setFilters(prev => ({ ...prev, acceptance_rate_min: e.target.value }))}
                        />
                        <input
                          type="number"
                          placeholder="最高"
                          className="input text-sm"
                          value={filters.acceptance_rate_max}
                          onChange={(e) => setFilters(prev => ({ ...prev, acceptance_rate_max: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">最高学费 ($)</label>
                    <input
                      type="number"
                      placeholder="例如: 60000"
                      className="input text-sm"
                      value={filters.tuition_max}
                      onChange={(e) => setFilters(prev => ({ ...prev, tuition_max: e.target.value }))}
                    />
                  </div>

                  <button
                    onClick={() => setFilters({
                      country: '', state: '', ranking_min: '', ranking_max: '',
                      acceptance_rate_min: '', acceptance_rate_max: '', tuition_max: ''
                    })}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    清除所有筛选
                  </button>
                </div>
              )}

              {/* University List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="text-sm text-gray-600 mb-2">
                  找到 {filteredUniversities.length} 所大学
                </div>
                {filteredUniversities.map((university) => (
                  <div
                    key={university.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedUniversity?.id === university.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedUniversity(university)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Building2 className="h-4 w-4 text-blue-600 mr-2" />
                          <h3 className="font-semibold text-gray-900 text-sm">{university.name}</h3>
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {university.city}, {university.state}
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          {university.us_news_ranking && (
                            <div className="flex items-center text-amber-600">
                              <Star className="h-3 w-3 mr-1" />
                              #{university.us_news_ranking}
                            </div>
                          )}
                          {university.acceptance_rate && (
                            <div className="flex items-center text-green-600">
                              <Users className="h-3 w-3 mr-1" />
                              {university.acceptance_rate}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {university.application_fee && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${university.application_fee}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUniversities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">未找到匹配的大学</p>
                    <p className="text-xs">请尝试调整搜索条件或筛选器</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form Section */}
              <div className="xl:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">申请详情</h2>
            
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

              {/* University Info & Progress Section */}
              {selectedUniversity && (
                <div className="xl:col-span-1 space-y-6">
                  {/* University Information Panel */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedUniversity.name}</h3>
                        <p className="text-sm text-gray-600">{selectedUniversity.short_name}</p>
                      </div>
                      {selectedUniversity.us_news_ranking && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-600">#{selectedUniversity.us_news_ranking}</div>
                          <div className="text-xs text-gray-500">US News排名</div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{selectedUniversity.city}, {selectedUniversity.state}, {selectedUniversity.country}</span>
                      </div>
                      
                      {selectedUniversity.acceptance_rate && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-gray-400 mr-2" />
                          <span>录取率: {selectedUniversity.acceptance_rate}%</span>
                        </div>
                      )}
                      
                      {selectedUniversity.application_fee && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span>申请费: ${selectedUniversity.application_fee}</span>
                        </div>
                      )}
                      
                      {selectedUniversity.tuition_out_state && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                          <span>学费: ${selectedUniversity.tuition_out_state.toLocaleString()}/年</span>
                        </div>
                      )}
                      
                      {selectedUniversity.application_system && (
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span>申请系统: {selectedUniversity.application_system}</span>
                        </div>
                      )}
                    </div>

                    {/* Deadlines */}
                    {selectedUniversity.deadlines && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          重要截止日期
                        </h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(selectedUniversity.deadlines as any).map(([type, date]) => (
                            <div key={type} className="flex justify-between">
                              <span className="text-blue-700">
                                {type === 'early_decision' ? 'ED' :
                                 type === 'early_action' ? 'EA' :
                                 type === 'regular_decision' ? 'RD' : type}:
                              </span>
                              <span className="text-blue-900 font-medium">{date as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <ProgressVisualization currentStatus="not_started" />
                  <ApplicationTimeline 
                    selectedUniversity={selectedUniversity}
                    applicationDeadline={formData.deadline}
                  />
                  <RequirementsChecklist 
                    universityId={selectedUniversity.id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
