import { useTranslation } from 'react-i18next'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'

function formatDuration(minutes: number | undefined): string {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function TimeLog() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { timeEntries, tasks, jobSites } = useApp()

  const myEntries = timeEntries
    .filter(e => e.workerId === currentUser?.id)
    .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())

  const totalMinutes = myEntries.filter(e => e.totalMinutes).reduce((s, e) => s + (e.totalMinutes ?? 0), 0)
  const overtimeCount = myEntries.filter(e => e.isOvertime).length

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-black text-navy-900">{t('nav.timeLog')}</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-black text-navy-900">{myEntries.length}</p>
          <p className="text-xs text-gray-500">{t('workerView.entries')}</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm text-center">
          <p className="text-lg font-black text-navy-900">{formatDuration(totalMinutes)}</p>
          <p className="text-xs text-gray-500">{t('workerView.totalTime')}</p>
        </div>
        <div className={`rounded-2xl p-3.5 border shadow-sm text-center ${overtimeCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <p className={`text-lg font-black ${overtimeCount > 0 ? 'text-red-500' : 'text-navy-900'}`}>{overtimeCount}</p>
          <p className={`text-xs ${overtimeCount > 0 ? 'text-red-400' : 'text-gray-500'}`}>{t('workerView.overtime')}</p>
        </div>
      </div>

      {/* Entries */}
      {myEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <Clock size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t('timeTracking.noEntries')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myEntries.map(entry => {
            const task = tasks.find(t => t.id === entry.taskId)
            const site = jobSites.find(s => s.id === entry.jobSiteId)
            const overMin = task && entry.totalMinutes ? entry.totalMinutes - task.estimatedMinutes : 0

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl border shadow-sm p-4 ${entry.isOvertime ? 'border-red-200' : 'border-gray-100'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{task?.title ?? 'Unknown task'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{site?.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-navy-900">{formatDuration(entry.totalMinutes)}</p>
                    {!entry.clockOut && (
                      <p className="text-xs text-orange-500 font-semibold flex items-center gap-0.5 justify-end">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        {t('timeTracking.activeStatus')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-xs text-gray-400">
                  <span>
                    {new Date(entry.clockIn).toLocaleDateString()} ·{' '}
                    {new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {entry.clockOut && ` → ${new Date(entry.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </span>
                  {entry.isOvertime ? (
                    <span className="flex items-center gap-1 text-red-500 font-semibold">
                      <AlertTriangle size={11} />
                      +{overMin}m {t('timeTracking.overBy')}
                    </span>
                  ) : entry.clockOut ? (
                    <CheckCircle2 size={13} className="text-green-500" />
                  ) : null}
                </div>

                {entry.isOvertime && task && (
                  <div className="mt-2 bg-red-50 rounded-lg px-2.5 py-1.5 text-xs text-red-600">
                    {t('timeTracking.overtimeWarning')} (est. {task.estimatedMinutes}m, actual {entry.totalMinutes}m)
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
