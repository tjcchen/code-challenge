'use client'

import { useState } from 'react'
import { CheckCircle, Circle, FileText, GraduationCap, Users, DollarSign, Calendar, AlertTriangle } from 'lucide-react'

interface Requirement {
  id: string
  title: string
  description: string
  category: 'academic' | 'testing' | 'essays' | 'recommendations' | 'financial' | 'other'
  required: boolean
  completed: boolean
  deadline?: string
  notes?: string
}

interface RequirementsChecklistProps {
  universityId?: string
  applicationId?: string
  onRequirementsUpdate?: (requirements: Requirement[]) => void
}

export function RequirementsChecklist({ 
  universityId, 
  applicationId, 
  onRequirementsUpdate 
}: RequirementsChecklistProps) {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      id: '1',
      title: '高中成绩单',
      description: '官方高中成绩单，需要学校盖章',
      category: 'academic',
      required: true,
      completed: false,
      deadline: '2024-12-01'
    },
    {
      id: '2', 
      title: 'SAT/ACT 成绩',
      description: '标准化考试成绩，直接从考试机构发送',
      category: 'testing',
      required: true,
      completed: false,
      deadline: '2024-12-01'
    },
    {
      id: '3',
      title: '个人陈述 (Personal Statement)',
      description: '650字以内的个人陈述文章',
      category: 'essays',
      required: true,
      completed: false,
      deadline: '2024-12-01'
    },
    {
      id: '4',
      title: '推荐信 (2封)',
      description: '来自老师或辅导员的推荐信',
      category: 'recommendations',
      required: true,
      completed: false,
      deadline: '2024-11-15'
    },
    {
      id: '5',
      title: 'FAFSA 表格',
      description: '联邦学生援助免费申请表',
      category: 'financial',
      required: false,
      completed: false,
      deadline: '2024-10-01'
    },
    {
      id: '6',
      title: '课外活动列表',
      description: '详细的课外活动和成就列表',
      category: 'other',
      required: true,
      completed: false
    }
  ])

  const toggleRequirement = (requirementId: string) => {
    const updatedRequirements = requirements.map(req => {
      if (req.id === requirementId) {
        return { ...req, completed: !req.completed }
      }
      return req
    })
    setRequirements(updatedRequirements)
    onRequirementsUpdate?.(updatedRequirements)
  }

  const updateNotes = (requirementId: string, notes: string) => {
    const updatedRequirements = requirements.map(req => {
      if (req.id === requirementId) {
        return { ...req, notes }
      }
      return req
    })
    setRequirements(updatedRequirements)
    onRequirementsUpdate?.(updatedRequirements)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return <GraduationCap className="h-4 w-4" />
      case 'testing': return <FileText className="h-4 w-4" />
      case 'essays': return <FileText className="h-4 w-4" />
      case 'recommendations': return <Users className="h-4 w-4" />
      case 'financial': return <DollarSign className="h-4 w-4" />
      default: return <Circle className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'academic': return 'text-blue-600 bg-blue-100'
      case 'testing': return 'text-purple-600 bg-purple-100'
      case 'essays': return 'text-green-600 bg-green-100'
      case 'recommendations': return 'text-orange-600 bg-orange-100'
      case 'financial': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'academic': return '学术材料'
      case 'testing': return '标准化考试'
      case 'essays': return '文书材料'
      case 'recommendations': return '推荐信'
      case 'financial': return '财务材料'
      default: return '其他'
    }
  }

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false
    return new Date(deadline) < new Date()
  }

  const getCompletionStats = () => {
    const total = requirements.length
    const completed = requirements.filter(req => req.completed).length
    const required = requirements.filter(req => req.required).length
    const requiredCompleted = requirements.filter(req => req.required && req.completed).length
    
    return { total, completed, required, requiredCompleted }
  }

  const stats = getCompletionStats()
  const completionPercentage = Math.round((stats.completed / stats.total) * 100)

  const groupedRequirements = requirements.reduce((groups, req) => {
    const category = req.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(req)
    return groups
  }, {} as Record<string, Requirement[]>)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">申请材料清单</h3>
            <p className="text-sm text-gray-600">跟踪所有必需和可选的申请材料</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            <div className="text-xs text-gray-500">完成度</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-600">
              {stats.requiredCompleted}/{stats.required}
            </div>
            <div className="text-xs text-gray-600">必需材料</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-600">
              {stats.completed}/{stats.total}
            </div>
            <div className="text-xs text-gray-600">总材料</div>
          </div>
        </div>
      </div>

      {/* Requirements by Category */}
      <div className="space-y-6">
        {Object.entries(groupedRequirements).map(([category, categoryRequirements]) => (
          <div key={category}>
            <div className="flex items-center mb-3">
              <div className={`p-2 rounded-lg mr-3 ${getCategoryColor(category)}`}>
                {getCategoryIcon(category)}
              </div>
              <h4 className="font-medium text-gray-900">{getCategoryName(category)}</h4>
              <span className="ml-2 text-sm text-gray-500">
                ({categoryRequirements.filter(req => req.completed).length}/{categoryRequirements.length})
              </span>
            </div>

            <div className="space-y-3 ml-6">
              {categoryRequirements.map((requirement) => (
                <div key={requirement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleRequirement(requirement.id)}
                        className="mt-0.5 hover:scale-110 transition-transform"
                      >
                        {requirement.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className={`font-medium ${requirement.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {requirement.title}
                          </h5>
                          {requirement.required && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              必需
                            </span>
                          )}
                          {requirement.deadline && isOverdue(requirement.deadline) && !requirement.completed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              逾期
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {requirement.description}
                        </p>
                        
                        {requirement.deadline && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            截止日期: {new Date(requirement.deadline).toLocaleDateString('zh-CN')}
                          </div>
                        )}

                        {/* Notes */}
                        <div className="mt-3">
                          <textarea
                            placeholder="添加备注..."
                            className="w-full text-sm border border-gray-200 rounded px-3 py-2 resize-none"
                            rows={2}
                            value={requirement.notes || ''}
                            onChange={(e) => updateNotes(requirement.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>进度总结:</strong> 已完成 {stats.completed} 项，还需完成 {stats.total - stats.completed} 项
          </p>
          {stats.requiredCompleted < stats.required && (
            <p className="text-red-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              还有 {stats.required - stats.requiredCompleted} 项必需材料未完成
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
