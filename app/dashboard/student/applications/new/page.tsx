'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { useUser } from '@supabase/auth-helpers-react'
import { Navbar } from '@/components/layout/Navbar'
import { Building2, Search, Filter, MapPin, Users, DollarSign, FileText, ArrowLeft, Award, Star, Calendar } from 'lucide-react'
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
  const [showApplicationForm, setShowApplicationForm] = useState(false)

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
      router.refresh() // Force refresh to reload server data
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

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* University Search & Filters */}
          <div className="lg:col-span-2">
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

          {/* University Information Panel */}
          <div className="lg:col-span-4">
            {selectedUniversity ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                {/* University Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center">
                    <div className="p-4 bg-blue-100 rounded-xl mr-6">
                      <Building2 className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedUniversity.name}</h2>
                      <p className="text-xl text-gray-600">{selectedUniversity.short_name}</p>
                    </div>
                  </div>
                  {selectedUniversity.us_news_ranking && (
                    <div className="text-right">
                      <div className="text-5xl font-bold text-amber-600">#{selectedUniversity.us_news_ranking}</div>
                      <div className="text-sm text-gray-500">US News排名</div>
                    </div>
                  )}
                </div>

                {/* Apply Button - Prominent */}
                <div className="mb-8">
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl"
                  >
                    <FileText className="h-6 w-6 mr-3" />
                    申请 {selectedUniversity.name}
                  </button>
                </div>

                {/* University Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h3>
                    
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg mr-4">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">位置</div>
                        <div className="font-semibold text-lg">{selectedUniversity.city}, {selectedUniversity.state}</div>
                        <div className="text-gray-600">{selectedUniversity.country}</div>
                      </div>
                    </div>
                    
                    {selectedUniversity.acceptance_rate && (
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">录取率</div>
                          <div className="font-semibold text-2xl text-green-700">{selectedUniversity.acceptance_rate}%</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedUniversity.application_fee && (
                      <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 rounded-lg mr-4">
                          <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">申请费</div>
                          <div className="font-semibold text-2xl text-yellow-700">${selectedUniversity.application_fee}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedUniversity.tuition_out_state && (
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg mr-4">
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">年学费</div>
                          <div className="font-semibold text-2xl text-purple-700">${selectedUniversity.tuition_out_state.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedUniversity.application_system && (
                      <div className="flex items-center">
                        <div className="p-3 bg-gray-100 rounded-lg mr-4">
                          <FileText className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">申请系统</div>
                          <div className="font-semibold text-lg">{selectedUniversity.application_system}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Visualization */}
                  <div>
                    <ProgressVisualization currentStatus="not_started" />
                  </div>
                </div>

                {/* Deadlines */}
                {selectedUniversity.deadlines && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">重要截止日期</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(selectedUniversity.deadlines as any).map(([type, date]) => (
                        <div key={type} className="p-4 bg-blue-50 rounded-xl text-center">
                          <div className="text-sm font-medium text-blue-700 mb-2">
                            {type === 'early_decision' ? 'Early Decision' :
                             type === 'early_action' ? 'Early Action' :
                             type === 'regular_decision' ? 'Regular Decision' : type}
                          </div>
                          <div className="text-xl font-bold text-blue-900">{date as string}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline and Requirements */}
                <div className="space-y-8">
                  <ApplicationTimeline 
                    selectedUniversity={selectedUniversity}
                    applicationDeadline={formData.deadline}
                  />
                  <RequirementsChecklist 
                    universityId={selectedUniversity.id}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="p-6 bg-blue-100 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <Building2 className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">选择一所大学</h2>
                  <p className="text-gray-600 mb-8">从左侧列表中选择一所大学，查看详细信息并开始申请</p>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>搜索筛选</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <span>选择大学</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                      <span>提交申请</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Form Modal */}
        {showApplicationForm && selectedUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Form Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">申请 {selectedUniversity.name}</h2>
                    <p className="text-gray-600">填写申请信息并提交</p>
                  </div>
                  <button
                    onClick={() => setShowApplicationForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="label">申请类型 *</label>
                  <select
                    className="input"
                    value={formData.application_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, application_type: e.target.value as ApplicationType }))}
                    required
                  >
                    <option value="early_decision">Early Decision</option>
                    <option value="early_action">Early Action</option>
                    <option value="regular_decision">Regular Decision</option>
                    <option value="rolling_admission">Rolling Admission</option>
                  </select>
                </div>

                <div>
                  <label className="label">意向专业</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="例如：计算机科学、生物学等"
                    value={formData.intended_major}
                    onChange={(e) => setFormData(prev => ({ ...prev, intended_major: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label">申请截止日期 *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="label">优先级</label>
                  <select
                    className="input"
                    value={formData.priority_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority_level: parseInt(e.target.value) }))}
                  >
                    <option value={5}>5 - 梦校</option>
                    <option value={4}>4 - 高优先级</option>
                    <option value={3}>3 - 中等优先级</option>
                    <option value={2}>2 - 低优先级</option>
                    <option value={1}>1 - 保底学校</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={formData.financial_aid_requested}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        financial_aid_requested: e.target.checked 
                      }))}
                    />
                    <span>申请经济援助</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3"
                      checked={formData.scholarship_applied}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        scholarship_applied: e.target.checked 
                      }))}
                    />
                    <span>申请奖学金</span>
                  </label>
                </div>

                <div>
                  <label className="label">备注</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="关于此申请的任何额外说明..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? '创建中...' : '创建申请'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
