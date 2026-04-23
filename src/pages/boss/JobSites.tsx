import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, MapPin, Users, ClipboardList, Calendar } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import type { SiteStatus } from '../../types'

export default function JobSites() {
  const { t } = useTranslation()
  const { jobSites, addJobSite, updateJobSite, tasks, users } = useApp()
  const { currentUser } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<SiteStatus | 'all'>('all')

  const workers = users.filter(u => u.role === 'worker')

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    startDate: '',
    endDate: '',
    description: '',
    workerIds: [] as string[],
  })

  const filtered = filterStatus === 'all'
    ? jobSites
    : jobSites.filter(s => s.status === filterStatus)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addJobSite({
      ...form,
      bossId: currentUser!.id,
      status: 'active',
    })
    setShowModal(false)
    setForm({ name: '', address: '', city: '', state: '', startDate: '', endDate: '', description: '', workerIds: [] })
  }

  const toggleWorker = (id: string) => {
    setForm(f => ({
      ...f,
      workerIds: f.workerIds.includes(id)
        ? f.workerIds.filter(w => w !== id)
        : [...f.workerIds, id],
    }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-900">{t('jobSites.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          {t('jobSites.addSite')}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'paused', 'completed'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filterStatus === s
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s === 'all' ? t('common.all') : t(`common.${s}`)}
          </button>
        ))}
      </div>

      {/* Sites grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <MapPin size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('jobSites.noSites')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(site => {
            const siteTasks = tasks.filter(tk => tk.jobSiteId === site.id)
            const completed = siteTasks.filter(tk => tk.status === 'completed').length
            const pct = siteTasks.length ? Math.round((completed / siteTasks.length) * 100) : 0
            const assignedWorkers = workers.filter(w => site.workerIds.includes(w.id))

            return (
              <div key={site.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-navy-900 text-base leading-tight">{site.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={12} />
                        {site.address}, {site.city}, {site.state}
                      </p>
                    </div>
                    <StatusBadge status={site.status} />
                  </div>

                  {site.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{site.description}</p>
                  )}

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{t('common.progress')}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-brand rounded-full h-2 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {assignedWorkers.length} {t('jobSites.workers')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList size={13} />
                      {siteTasks.length} {t('jobSites.tasks')}
                    </span>
                    {site.startDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {new Date(site.startDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assigned workers avatars */}
                {assignedWorkers.length > 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5">
                    {assignedWorkers.slice(0, 5).map(w => (
                      <div
                        key={w.id}
                        className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold"
                        title={w.name}
                      >
                        {w.name.charAt(0)}
                      </div>
                    ))}
                    {assignedWorkers.length > 5 && (
                      <span className="text-xs text-gray-500">+{assignedWorkers.length - 5}</span>
                    )}
                    <div className="ml-auto flex gap-2">
                      {site.status === 'active' && (
                        <button
                          onClick={() => updateJobSite(site.id, { status: 'paused' })}
                          className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-1 rounded-lg"
                        >
                          {t('common.pause')}
                        </button>
                      )}
                      {site.status === 'paused' && (
                        <button
                          onClick={() => updateJobSite(site.id, { status: 'active' })}
                          className="text-xs text-green-600 hover:text-green-700 border border-green-200 px-2 py-1 rounded-lg"
                        >
                          {t('common.resume')}
                        </button>
                      )}
                      <button
                        onClick={() => updateJobSite(site.id, { status: 'completed' })}
                        className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 px-2 py-1 rounded-lg"
                      >
                        {t('common.complete')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add site modal */}
      {showModal && (
        <Modal title={t('jobSites.addSite')} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.siteName')} *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Riverside Condos Phase 2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.siteAddress')} *</label>
              <input
                required
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="1450 Riverside Drive"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.city')} *</label>
                <input
                  required
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Austin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.state')} *</label>
                <input
                  required
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="TX"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.startDate')}</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('jobSites.endDate')}</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.description')}</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                placeholder="Brief project description..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('jobSites.assignWorkers')}</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {workers.map(w => (
                  <label key={w.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.workerIds.includes(w.id)}
                      onChange={() => toggleWorker(w.id)}
                      className="accent-brand"
                    />
                    <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold">
                      {w.name.charAt(0)}
                    </div>
                    <span className="text-sm text-gray-700">{w.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-brand hover:bg-orange-600 text-white rounded-xl font-bold">
                {t('common.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
