'use client'

import { useState } from 'react'
import { Check, ChevronRight, Clock, FileText, Eye, Trophy, X, Pause } from 'lucide-react'
import type { ApplicationStatus } from '@/types/database'

interface StatusWorkflowProps {
  currentStatus: ApplicationStatus
  applicationId: string
  onStatusChange?: (newStatus: ApplicationStatus) => void
  readOnly?: boolean
}

const statusFlow: { 
  key: ApplicationStatus
  label: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  description: string
}[] = [
  {
    key: 'not_started',
    label: '未开始',
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Application not yet started'
  },
  {
    key: 'in_progress',
    label: '进行中',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Working on application materials'
  },
  {
    key: 'submitted',
    label: '已提交',
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Application submitted successfully'
  },
  {
    key: 'under_review',
    label: '审核中',
    icon: Eye,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Under university review'
  },
  {
    key: 'accepted',
    label: '录取',
    icon: Trophy,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Congratulations! Accepted'
  },
  {
    key: 'rejected',
    label: '拒绝',
    icon: X,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Application rejected'
  },
  {
    key: 'waitlisted',
    label: '候补',
    icon: Pause,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Added to waitlist'
  }
]

export function StatusWorkflow({ currentStatus, applicationId, onStatusChange, readOnly = false }: StatusWorkflowProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  const currentIndex = statusFlow.findIndex(status => status.key === currentStatus)
  
  const handleStatusUpdate = async (newStatus: ApplicationStatus) => {
    if (readOnly || isUpdating) return
    
    setIsUpdating(true)
    try {
      // Here you would typically make an API call to update the status
      // For now, we'll just call the callback
      onStatusChange?.(newStatus)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentIndex + 1) / Math.min(statusFlow.length - 2, 4)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(((currentIndex + 1) / Math.min(statusFlow.length - 2, 4)) * 100, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Status Flow */}
      <div className="space-y-3">
        {statusFlow.map((status, index) => {
          const Icon = status.icon
          const isActive = status.key === currentStatus
          const isPassed = index < currentIndex
          const isClickable = !readOnly && (index <= currentIndex + 1) && status.key !== 'deferred'
          
          return (
            <div key={status.key} className="flex items-center group">
              {/* Status Icon */}
              <div 
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200
                  ${isActive 
                    ? `${status.bgColor} ${status.color} border-current` 
                    : isPassed 
                      ? 'bg-green-100 text-green-600 border-green-600'
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : ''}
                `}
                onClick={() => isClickable && handleStatusUpdate(status.key)}
              >
                {isPassed && !isActive ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Status Info */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isActive ? status.color : isPassed ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.label}
                    </p>
                    <p className="text-sm text-gray-500">{status.description}</p>
                  </div>
                  
                  {isActive && (
                    <span className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full">
                      Current
                    </span>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < statusFlow.length - 1 && (
                <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-200" />
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      {!readOnly && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Quick Actions:</p>
          <div className="flex flex-wrap gap-2">
            {currentStatus === 'not_started' && (
              <button
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={isUpdating}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                Start Application
              </button>
            )}
            {currentStatus === 'in_progress' && (
              <button
                onClick={() => handleStatusUpdate('submitted')}
                disabled={isUpdating}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                Mark as Submitted
              </button>
            )}
            {currentStatus === 'submitted' && (
              <button
                onClick={() => handleStatusUpdate('under_review')}
                disabled={isUpdating}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                Under Review
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
