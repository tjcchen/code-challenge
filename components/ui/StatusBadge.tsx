import type { ApplicationStatus } from '@/types/database'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusClass = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return 'status-not-started'
      case 'in_progress':
        return 'status-in-progress'
      case 'submitted':
        return 'status-submitted'
      case 'under_review':
        return 'status-under-review'
      case 'accepted':
        return 'status-accepted'
      case 'rejected':
        return 'status-rejected'
      case 'waitlisted':
        return 'status-waitlisted'
      case 'deferred':
        return 'status-deferred'
      default:
        return 'status-not-started'
    }
  }

  const getStatusText = (status: ApplicationStatus) => {
    switch (status) {
      case 'not_started':
        return 'Not Started'
      case 'in_progress':
        return 'In Progress'
      case 'submitted':
        return 'Submitted'
      case 'under_review':
        return 'Under Review'
      case 'accepted':
        return 'Accepted'
      case 'rejected':
        return 'Rejected'
      case 'waitlisted':
        return 'Waitlisted'
      case 'deferred':
        return 'Deferred'
      default:
        return 'Unknown'
    }
  }

  return (
    <span className={`${getStatusClass(status)} ${className}`}>
      {getStatusText(status)}
    </span>
  )
}
