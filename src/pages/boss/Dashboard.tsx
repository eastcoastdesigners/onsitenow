import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Users, ClipboardList, AlertTriangle, Plus, ChevronRight, Clock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'

export default function BossDashboard() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { jobSites, tasks, users, checkIns, alerts } = useApp()
  const navigate = useNavigate()

  const myWorkers = users.filter(u => u.role === 'worker')
  const activeSites = jobSites.filter(s => s.status === 'active')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const overdueTasks = tasks.filter(t => t.status === 'overdue')
  const unreadAlerts = alerts.filter(a => !a.read)

  const todayStr = new Date().toDateString()
  const todayCheckIns = checkIns.filter(c => new Date(c.timestamp).toDateString() === todayStr)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.welcome') : hour < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening')

  const stats = [
    {
      label: t('dashboard.activeJobSites'),
      value: activeSites.length,
      icon: MapPin,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      to: '/boss/sites',
    },
    {
      label: t('dashboard.totalWorkers'),
      value: myWorkers.length,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
      to: '/boss/workers',
    },
    {
      label: t('dashboard.tasksInProgress'),
      value: inProgressTasks.length,
      icon: ClipboardList,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      to: '/boss/tasks',
    },
    {
      label: t('dashboard.overdueAlerts'),
      value: unreadAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      to: '/boss/tasks',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-navy-900">
            {greeting}, {currentUser?.name.split(' ')[0]} 👋
          </h1>
          {currentUser?.companyName && (
            <p className="text-gray-500 text-sm mt-0.5">{currentUser.companyName}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/boss/sites')}
            className="flex items-center gap-1.5 bg-navy-900 hover:bg-navy-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            {t('dashboard.addJobSite')}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-black text-navy-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Job Sites */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-navy-900">{t('nav.jobSites')}</h2>
            <button
              onClick={() => navigate('/boss/sites')}
              className="text-brand text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              {t('dashboard.viewAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {activeSites.slice(0, 4).map(site => {
              const siteTaskCount = tasks.filter(tk => tk.jobSiteId === site.id).length
              const completedCount = tasks.filter(tk => tk.jobSiteId === site.id && tk.status === 'completed').length
              const pct = siteTaskCount > 0 ? Math.round((completedCount / siteTaskCount) * 100) : 0
              return (
                <button
                  key={site.id}
                  onClick={() => navigate('/boss/sites')}
                  className="w-full px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{site.name}</p>
                      <p className="text-xs text-gray-400">{site.city}, {site.state} · {site.workerIds.length} {t('jobSites.workers')}</p>
                    </div>
                    <StatusBadge status={site.status} />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-brand rounded-full h-1.5 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{pct}% {t('common.complete').toLowerCase()} · {siteTaskCount} {t('jobSites.tasks')}</p>
                </button>
              )
            })}
            {activeSites.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">{t('jobSites.noSites')}</p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-navy-900">{t('nav.tasks')}</h2>
            <button
              onClick={() => navigate('/boss/tasks')}
              className="text-brand text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              {t('dashboard.viewAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.slice(0, 5).map(task => {
              const assignee = myWorkers.find(w => w.id === task.assignedTo)
              return (
                <button
                  key={task.id}
                  onClick={() => navigate('/boss/tasks')}
                  className="w-full px-5 py-3.5 hover:bg-gray-50 transition-colors text-left flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{task.title}</p>
                    <p className="text-xs text-gray-400">{assignee?.name ?? t('tasks.unassigned')} · {task.estimatedMinutes} {t('common.minutes')} est.</p>
                  </div>
                  <StatusBadge status={task.status} />
                </button>
              )
            })}
            {tasks.length === 0 && (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">{t('tasks.noTasks')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's activity row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-green-500" />
            <span className="font-bold text-gray-900">{t('dashboard.checkedInToday')}</span>
          </div>
          <p className="text-4xl font-black text-navy-900">{todayCheckIns.length}</p>
          <p className="text-sm text-gray-400 mt-1">{t('dashboard.workersOnSite')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-orange-500" />
            <span className="font-bold text-gray-900">{t('dashboard.activeTimers')}</span>
          </div>
          <p className="text-4xl font-black text-navy-900">{inProgressTasks.length}</p>
          <p className="text-sm text-gray-400 mt-1">{t('dashboard.tasksClocked')}</p>
        </div>

        <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="font-bold text-red-800">{t('dashboard.needsAttention')}</span>
          </div>
          <p className="text-4xl font-black text-red-600">{overdueTasks.length}</p>
          <p className="text-sm text-red-400 mt-1">{t('dashboard.overdueTasks')}</p>
        </div>
      </div>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-navy-900">{t('dashboard.alerts')}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {unreadAlerts.map(alert => (
              <div key={alert.id} className="px-5 py-4 flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.type === 'task_overdue' || alert.type === 'overtime' ? 'bg-red-500' : 'bg-orange-400'
                }`} />
                <div>
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(alert.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
