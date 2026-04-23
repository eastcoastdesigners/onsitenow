import { useTranslation } from 'react-i18next'
import { Clock, AlertTriangle, CheckCircle2, Timer } from 'lucide-react'
import { useApp } from '../../context/AppContext'

function formatDuration(minutes: number | undefined): string {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TimeTracking() {
  const { t } = useTranslation()
  const { timeEntries, tasks, users, jobSites } = useApp()

  const workers = users.filter(u => u.role === 'worker')
  const totalMinutesLogged = timeEntries
    .filter(e => e.totalMinutes)
    .reduce((sum, e) => sum + (e.totalMinutes ?? 0), 0)
  const overtimeEntries = timeEntries.filter(e => e.isOvertime)
  const activeTimers = timeEntries.filter(e => !e.clockOut)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-navy-900">{t('timeTracking.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-black text-navy-900">{timeEntries.length}</p>
          <p className="text-sm text-gray-500">{t('timeTracking.totalEntries')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-black text-navy-900">{formatDuration(totalMinutesLogged)}</p>
          <p className="text-sm text-gray-500">{t('timeTracking.totalLogged')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
            <Timer size={20} className="text-orange-600" />
          </div>
          <p className="text-3xl font-black text-navy-900">{activeTimers.length}</p>
          <p className="text-sm text-gray-500">{t('timeTracking.activeTimers')}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <p className="text-3xl font-black text-red-600">{overtimeEntries.length}</p>
          <p className="text-sm text-red-400">{t('timeTracking.overtimeAlerts')}</p>
        </div>
      </div>

      {/* Time entries table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy-900">{t('timeTracking.timeLogTitle')}</h2>
        </div>
        {timeEntries.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">{t('timeTracking.noEntries')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 border-b border-gray-100">
                  <th className="px-5 py-3">{t('timeTracking.worker')}</th>
                  <th className="px-5 py-3">{t('timeTracking.task')}</th>
                  <th className="px-5 py-3">{t('timeTracking.site')}</th>
                  <th className="px-5 py-3">{t('timeTracking.clockIn')}</th>
                  <th className="px-5 py-3">{t('timeTracking.clockOut')}</th>
                  <th className="px-5 py-3">{t('timeTracking.totalTime')}</th>
                  <th className="px-5 py-3">{t('timeTracking.overtime')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {timeEntries.map(entry => {
                  const worker = workers.find(w => w.id === entry.workerId)
                  const task = tasks.find(t => t.id === entry.taskId)
                  const site = jobSites.find(s => s.id === entry.jobSiteId)
                  const estimated = task?.estimatedMinutes ?? 0
                  const overMin = entry.totalMinutes ? entry.totalMinutes - estimated : 0

                  return (
                    <tr key={entry.id} className={`hover:bg-gray-50 transition-colors ${entry.isOvertime ? 'bg-red-50/30' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold">
                            {worker?.name.charAt(0) ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{worker?.name ?? 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-700 line-clamp-1 max-w-[200px]">{task?.title ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500">{site?.name ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-700">{formatTime(entry.clockIn)}</span>
                        <p className="text-[11px] text-gray-400">{new Date(entry.clockIn).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {entry.clockOut ? (
                          <>
                            <span className="text-sm text-gray-700">{formatTime(entry.clockOut)}</span>
                            <p className="text-[11px] text-gray-400">{new Date(entry.clockOut).toLocaleDateString()}</p>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-orange-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            {t('timeTracking.activeStatus')}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">{formatDuration(entry.totalMinutes)}</span>
                        {task && entry.totalMinutes && (
                          <p className="text-[11px] text-gray-400">{t('timeTracking.estAbbr')} {task.estimatedMinutes}m</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {entry.isOvertime ? (
                          <div className="flex items-center gap-1 text-red-500">
                            <AlertTriangle size={13} />
                            <span className="text-xs font-semibold">+{overMin}m</span>
                          </div>
                        ) : (
                          <CheckCircle2 size={15} className="text-green-500" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active timers */}
      {activeTimers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <h2 className="font-bold text-navy-900">{t('timeTracking.currentlyClockedIn')}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activeTimers.map(entry => {
              const worker = workers.find(w => w.id === entry.workerId)
              const task = tasks.find(t => t.id === entry.taskId)
              const elapsed = Math.round((Date.now() - new Date(entry.clockIn).getTime()) / 60000)
              const isOver = task && elapsed > task.estimatedMinutes

              return (
                <div key={entry.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white font-bold text-sm">
                      {worker?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{worker?.name}</p>
                      <p className="text-sm text-gray-500 truncate">{task?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isOver ? 'text-red-500' : 'text-green-600'}`}>
                      {formatDuration(elapsed)}
                    </p>
                    {isOver && (
                      <p className="text-xs text-red-400 flex items-center gap-1 justify-end">
                        <AlertTriangle size={10} />
                        {t('tasks.overtimeAlert').replace('⚠️ ', '')}
                      </p>
                    )}
                    {!isOver && task && (
                      <p className="text-xs text-gray-400">of {task.estimatedMinutes}m {t('timeTracking.estAbbr')}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
