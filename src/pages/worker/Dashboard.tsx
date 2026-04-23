import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckSquare, Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'

function formatElapsed(clockIn: string): string {
  const ms = Date.now() - new Date(clockIn).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function WorkerDashboard() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { tasks, jobSites, checkIns, getActiveTimeEntry, timeEntries } = useApp()
  const navigate = useNavigate()

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id)
  const todayStr = new Date().toDateString()
  const todayCheckIn = checkIns.find(
    c => c.workerId === currentUser?.id && new Date(c.timestamp).toDateString() === todayStr
  )
  const activeEntry = currentUser ? getActiveTimeEntry(currentUser.id) : undefined

  const pendingTasks = myTasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const overdueTasks = myTasks.filter(t => t.status === 'overdue')
  const completedToday = myTasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === todayStr)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.welcome') : hour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening')

  return (
    <div className="p-4 space-y-5">
      <div>
        <h1 className="text-xl font-black text-navy-900">
          {greeting}, {currentUser?.name.split(' ')[0]} 👷
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Check-in card */}
      <div className={`rounded-2xl p-4 border-2 ${
        todayCheckIn
          ? 'bg-green-50 border-green-200'
          : 'bg-orange-50 border-brand'
      }`}>
        {todayCheckIn ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-green-800">✅ {t('workerView.checkedInToday')}</p>
              <p className="text-sm text-green-600">
                {new Date(todayCheckIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {todayCheckIn.location.address && ` · ${todayCheckIn.location.address}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-orange-800">⏰ {t('workerView.notCheckedIn')}</p>
              <p className="text-sm text-orange-600">{t('workerView.gpsCheckInRequired')}</p>
            </div>
            <button
              onClick={() => navigate('/worker/tasks')}
              className="bg-brand text-white font-bold px-4 py-2 rounded-xl text-sm"
            >
              {t('workerView.checkInButton')}
            </button>
          </div>
        )}
      </div>

      {/* Active timer */}
      {activeEntry && (
        <div className="bg-navy-900 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy-300 text-xs font-semibold uppercase tracking-wide">{t('workerView.timerRunning')}</p>
              <p className="font-bold text-lg mt-0.5">{formatElapsed(activeEntry.clockIn)}</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-navy-900">{pendingTasks.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('common.pending')}</p>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm text-center">
          <p className="text-2xl font-black text-green-600">{completedToday.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('workerView.doneToday')}</p>
        </div>
        <div className={`rounded-2xl p-3.5 border shadow-sm text-center ${overdueTasks.length > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
          <p className={`text-2xl font-black ${overdueTasks.length > 0 ? 'text-red-500' : 'text-navy-900'}`}>{overdueTasks.length}</p>
          <p className={`text-xs mt-0.5 ${overdueTasks.length > 0 ? 'text-red-400' : 'text-gray-500'}`}>{t('common.overdue')}</p>
        </div>
      </div>

      {/* Today's tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <h2 className="font-bold text-navy-900">{t('dashboard.todaysTasks')}</h2>
          <button onClick={() => navigate('/worker/tasks')} className="text-brand text-sm font-semibold flex items-center gap-0.5">
            {t('dashboard.viewAll')} <ChevronRight size={14} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {myTasks.slice(0, 4).map(task => {
            const site = jobSites.find(s => s.id === task.jobSiteId)
            return (
              <button
                key={task.id}
                onClick={() => navigate('/worker/tasks')}
                className="w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{task.title}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {site?.name ?? t('common.none')} · {task.estimatedMinutes}m
                  </p>
                </div>
                <StatusBadge status={task.status} />
              </button>
            )
          })}
          {myTasks.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-400 text-sm">{t('workerView.noTasksAssigned')}</p>
          )}
        </div>
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-500" />
            <p className="font-bold text-red-800 text-sm">{overdueTasks.length} {overdueTasks.length === 1 ? t('workerView.overdueTask') : t('workerView.overdueTasks')}</p>
          </div>
          {overdueTasks.map(t => (
            <p key={t.id} className="text-sm text-red-600 ml-6">• {t.title}</p>
          ))}
        </div>
      )}
    </div>
  )
}
