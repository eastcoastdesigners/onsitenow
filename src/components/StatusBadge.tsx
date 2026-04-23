import { useTranslation } from 'react-i18next'
import type { TaskStatus, SiteStatus, ChangeOrderStatus } from '../types'

type AnyStatus = TaskStatus | SiteStatus | ChangeOrderStatus

const STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700',
  overdue: 'bg-red-100 text-red-700',
  paused: 'bg-gray-100 text-gray-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

const LABELS: Record<string, string> = {
  active: 'common.active',
  completed: 'common.completed',
  pending: 'common.pending',
  in_progress: 'In Progress',
  overdue: 'common.overdue',
  paused: 'common.paused',
  approved: 'common.approved',
  rejected: 'common.rejected',
}

export default function StatusBadge({ status }: { status: AnyStatus }) {
  const { t } = useTranslation()
  const style = STYLES[status] ?? 'bg-gray-100 text-gray-600'
  const label = LABELS[status]
  const text = label?.startsWith('common.') ? t(label) : (label ?? status)

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {text}
    </span>
  )
}
