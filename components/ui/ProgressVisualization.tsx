'use client'

import { CheckCircle, Circle, Clock, FileText, Send, Eye, GraduationCap } from 'lucide-react'

interface ProgressStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
  icon: React.ComponentType<any>
}

interface ProgressVisualizationProps {
  currentStatus?: string
  className?: string
}

export function ProgressVisualization({ currentStatus = 'not_started', className = '' }: ProgressVisualizationProps) {
  const steps: ProgressStep[] = [
    {
      id: 'not_started',
      title: '准备阶段',
      description: '收集材料和信息',
      status: 'completed',
      icon: FileText
    },
    {
      id: 'in_progress', 
      title: '申请进行中',
      description: '填写申请表格',
      status: currentStatus === 'not_started' ? 'upcoming' : 'completed',
      icon: Clock
    },
    {
      id: 'submitted',
      title: '已提交',
      description: '申请材料已发送',
      status: ['not_started', 'in_progress'].includes(currentStatus) ? 'upcoming' : 'completed',
      icon: Send
    },
    {
      id: 'under_review',
      title: '审核中',
      description: '大学正在审核',
      status: ['not_started', 'in_progress', 'submitted'].includes(currentStatus) ? 'upcoming' : 'completed',
      icon: Eye
    },
    {
      id: 'decision',
      title: '录取决定',
      description: '等待最终结果',
      status: ['accepted', 'rejected', 'waitlisted'].includes(currentStatus) ? 'completed' : 'upcoming',
      icon: GraduationCap
    }
  ]

  // Update current step based on status
  const updatedSteps = steps.map((step, index) => {
    if (step.id === currentStatus) {
      return { ...step, status: 'current' as const }
    }
    return step
  })

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 border-green-600 text-white'
      case 'current':
        return 'bg-blue-600 border-blue-600 text-white'
      case 'upcoming':
        return 'bg-gray-200 border-gray-300 text-gray-600'
      default:
        return 'bg-gray-200 border-gray-300 text-gray-600'
    }
  }

  const getConnectorColor = (currentIndex: number, steps: ProgressStep[]) => {
    const currentStep = steps[currentIndex]
    const nextStep = steps[currentIndex + 1]
    
    if (currentStep.status === 'completed') {
      return 'bg-green-600'
    }
    return 'bg-gray-300'
  }

  const getProgressPercentage = () => {
    const completedSteps = updatedSteps.filter(step => step.status === 'completed').length
    const currentStepIndex = updatedSteps.findIndex(step => step.status === 'current')
    const totalProgress = completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)
    return Math.round((totalProgress / updatedSteps.length) * 100)
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">申请进度</h3>
          <span className="text-sm font-medium text-blue-600">
            {getProgressPercentage()}% 完成
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="relative">
        {updatedSteps.map((step, index) => {
          const Icon = step.icon
          const isLast = index === updatedSteps.length - 1
          
          return (
            <div key={step.id} className="relative">
              <div className="flex items-start">
                {/* Step Icon */}
                <div className="flex-shrink-0 relative">
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)}`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  
                  {/* Connector Line */}
                  {!isLast && (
                    <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-12 ${getConnectorColor(index, updatedSteps)}`} />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="ml-4 pb-8">
                  <div className="flex items-center">
                    <h4 className={`font-medium ${
                      step.status === 'completed' ? 'text-green-700' :
                      step.status === 'current' ? 'text-blue-700' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    
                    {step.status === 'current' && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        当前步骤
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'current' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Status Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {updatedSteps.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">已完成</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {updatedSteps.filter(s => s.status === 'current').length}
            </div>
            <div className="text-xs text-gray-600">进行中</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">
              {updatedSteps.filter(s => s.status === 'upcoming').length}
            </div>
            <div className="text-xs text-gray-600">待完成</div>
          </div>
        </div>
      </div>
    </div>
  )
}
