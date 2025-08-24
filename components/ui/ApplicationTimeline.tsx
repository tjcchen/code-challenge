'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle, AlertTriangle, Circle, Plus, X } from 'lucide-react'

interface TimelineEvent {
  id: string
  title: string
  date: string
  type: 'deadline' | 'milestone' | 'reminder'
  status: 'upcoming' | 'completed' | 'overdue'
  description?: string
}

interface ApplicationTimelineProps {
  applicationId?: string
  selectedUniversity?: any
  applicationDeadline?: string
  onTimelineUpdate?: (events: TimelineEvent[]) => void
}

export function ApplicationTimeline({ 
  applicationId, 
  selectedUniversity, 
  applicationDeadline,
  onTimelineUpdate 
}: ApplicationTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      id: '1',
      title: '开始准备申请材料',
      date: new Date().toISOString().split('T')[0],
      type: 'milestone',
      status: 'completed',
      description: '收集成绩单、推荐信、个人陈述等材料'
    },
    {
      id: '2', 
      title: '完成在线申请',
      date: applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      type: 'deadline',
      status: 'upcoming',
      description: '提交完整的申请表格和所有材料'
    }
  ])
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    type: 'reminder' as const,
    description: ''
  })

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    
    const event: TimelineEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type,
      status: new Date(newEvent.date) < new Date() ? 'overdue' : 'upcoming',
      description: newEvent.description
    }
    
    const updatedEvents = [...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setEvents(updatedEvents)
    onTimelineUpdate?.(updatedEvents)
    
    setNewEvent({ title: '', date: '', type: 'reminder', description: '' })
    setShowAddForm(false)
  }

  const toggleEventStatus = (eventId: string) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          status: (event.status === 'completed' ? 'upcoming' : 'completed') as TimelineEvent['status']
        }
      }
      return event
    })
    setEvents(updatedEvents)
    onTimelineUpdate?.(updatedEvents)
  }

  const removeEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId)
    setEvents(updatedEvents)
    onTimelineUpdate?.(updatedEvents)
  }

  const getEventIcon = (event: TimelineEvent) => {
    if (event.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    
    switch (event.type) {
      case 'deadline':
        return event.status === 'overdue' 
          ? <AlertTriangle className="h-5 w-5 text-red-600" />
          : <Calendar className="h-5 w-5 text-blue-600" />
      case 'milestone':
        return <Circle className="h-5 w-5 text-purple-600" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-600" />
    }
  }

  const getEventColor = (event: TimelineEvent) => {
    if (event.status === 'completed') return 'border-green-200 bg-green-50'
    if (event.status === 'overdue') return 'border-red-200 bg-red-50'
    
    switch (event.type) {
      case 'deadline': return 'border-blue-200 bg-blue-50'
      case 'milestone': return 'border-purple-200 bg-purple-50'
      case 'reminder': return 'border-orange-200 bg-orange-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const formatted = date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (diffDays === 0) return `${formatted} (今天)`
    if (diffDays === 1) return `${formatted} (明天)`
    if (diffDays > 0 && diffDays <= 7) return `${formatted} (${diffDays}天后)`
    if (diffDays < 0 && diffDays >= -7) return `${formatted} (${Math.abs(diffDays)}天前)`
    
    return formatted
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">申请时间线</h3>
          <p className="text-sm text-gray-600">跟踪重要日期和里程碑</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          添加事件
        </button>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">添加新事件</h4>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="事件标题"
                className="input text-sm"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="input text-sm"
                value={newEvent.date}
                onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
              />
              <select
                className="input text-sm"
                value={newEvent.type}
                onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="reminder">提醒</option>
                <option value="deadline">截止日期</option>
                <option value="milestone">里程碑</option>
              </select>
            </div>
            <textarea
              placeholder="描述 (可选)"
              className="input text-sm"
              rows={2}
              value={newEvent.description}
              onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="flex space-x-2">
              <button
                onClick={addEvent}
                className="btn-primary text-sm px-3 py-1"
              >
                添加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="btn-secondary text-sm px-3 py-1"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline Line */}
            {index < events.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200" />
            )}
            
            <div className={`flex items-start space-x-4 p-4 rounded-lg border ${getEventColor(event)}`}>
              <div className="flex-shrink-0 mt-0.5">
                <button
                  onClick={() => toggleEventStatus(event.id)}
                  className="hover:scale-110 transition-transform"
                >
                  {getEventIcon(event)}
                </button>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-medium ${event.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(event.date)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center mt-2 space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'deadline' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'milestone' ? 'bg-purple-100 text-purple-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {event.type === 'deadline' ? '截止日期' : 
                     event.type === 'milestone' ? '里程碑' : '提醒'}
                  </span>
                  
                  {event.status === 'overdue' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      已逾期
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">暂无时间线事件</p>
            <p className="text-xs">点击"添加事件"开始跟踪重要日期</p>
          </div>
        )}
      </div>
    </div>
  )
}
