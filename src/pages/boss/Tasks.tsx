import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Link as LinkIcon, X, Clock, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import PhotoUpload from '../../components/PhotoUpload'
import type { TaskStatus, TaskPriority } from '../../types'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

export default function Tasks() {
  const { t } = useTranslation()
  const { tasks, addTask, updateTask, users, jobSites } = useApp()
  const { currentUser } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const workers = users.filter(u => u.role === 'worker')

  const [form, setForm] = useState({
    title: '',
    description: '',
    jobSiteId: '',
    assignedTo: '',
    estimatedMinutes: 60,
    priority: 'medium' as TaskPriority,
    dueDate: '',
    videoLinks: [] as string[],
    photosBefore: [] as string[],
    photosDuring: [] as string[],
    photosAfter: [] as string[],
  })
  const [videoLinkInput, setVideoLinkInput] = useState('')

  const filtered = filterStatus === 'all'
    ? tasks
    : tasks.filter(t => t.status === filterStatus)

  const addVideoLink = () => {
    if (videoLinkInput.trim()) {
      setForm(f => ({ ...f, videoLinks: [...f.videoLinks, videoLinkInput.trim()] }))
      setVideoLinkInput('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addTask({
      ...form,
      assignedBy: currentUser!.id,
      status: 'pending',
    })
    setShowModal(false)
    setForm({
      title: '', description: '', jobSiteId: '', assignedTo: '',
      estimatedMinutes: 60, priority: 'medium', dueDate: '',
      videoLinks: [], photosBefore: [], photosDuring: [], photosAfter: [],
    })
  }

  const viewTask = tasks.find(t => t.id === selectedTask)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-900">{t('tasks.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          {t('tasks.addTask')}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'in_progress', 'completed', 'overdue'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {s === 'all' ? t('common.all') : s === 'in_progress' ? t('common.inProgress') : t(`common.${s}`)}
            {s !== 'all' && (
              <span className="ml-1.5 text-xs opacity-70">
                {tasks.filter(t => t.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <p className="text-gray-500">{t('tasks.noTasks')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const worker = workers.find(w => w.id === task.assignedTo)
            const site = jobSites.find(s => s.id === task.jobSiteId)
            const hasPhotos = task.photosBefore.length + task.photosDuring.length + task.photosAfter.length

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  task.status === 'overdue' ? 'border-red-200' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy-900 truncate">{task.title}</h3>
                        {task.status === 'overdue' && (
                          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1 mb-2">{task.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {worker && (
                          <span className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-navy-600 text-white flex items-center justify-center text-[9px] font-bold">
                              {worker.name.charAt(0)}
                            </div>
                            {worker.name}
                          </span>
                        )}
                        {site && <span className="text-gray-400">📍 {site.name}</span>}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {task.estimatedMinutes} {t('common.minutes')}
                        </span>
                        {task.dueDate && (
                          <span>{t('tasks.dueDate')}: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        {hasPhotos > 0 && (
                          <span>📷 {hasPhotos} {t('common.photos')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge status={task.status} />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                        {t(`common.${task.priority}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTask(task.id)}
                    className="text-xs text-navy-600 font-semibold hover:underline"
                  >
                    {t('tasks.viewDetails')}
                  </button>
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTask(task.id, { status: 'in_progress', startedAt: new Date().toISOString() })}
                      className="text-xs bg-orange-100 text-orange-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-orange-200 ml-auto"
                    >
                      {t('tasks.markInProgress')}
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString() })}
                      className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-green-200 ml-auto"
                    >
                      {t('tasks.markComplete')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <Modal title={t('tasks.addTask')} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.taskTitle')} *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Install drywall — Building A Floor 3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.description')} *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand resize-none"
                placeholder="Detailed task instructions..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.jobSite')} *</label>
                <select
                  required
                  value={form.jobSiteId}
                  onChange={e => setForm(f => ({ ...f, jobSiteId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                >
                  <option value="">{t('common.selectSite')}</option>
                  {jobSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.assignTo')} *</label>
                <select
                  required
                  value={form.assignedTo}
                  onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                >
                  <option value="">{t('common.selectWorker')}</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.estimatedTime')}</label>
                <input
                  type="number"
                  min={15}
                  value={form.estimatedMinutes}
                  onChange={e => setForm(f => ({ ...f, estimatedMinutes: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.priority')}</label>
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as TaskPriority }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand bg-white"
                >
                  <option value="low">{t('common.low')}</option>
                  <option value="medium">{t('common.medium')}</option>
                  <option value="high">{t('common.high')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.dueDate')}</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            {/* Video links */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('tasks.videoLinks')}</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={videoLinkInput}
                  onChange={e => setVideoLinkInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVideoLink())}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
              {form.videoLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2 mb-1.5">
                  <LinkIcon size={12} className="text-blue-500" />
                  <span className="text-xs text-blue-700 flex-1 truncate">{link}</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, videoLinks: f.videoLinks.filter((_, j) => j !== i) }))}
                  >
                    <X size={12} className="text-blue-400 hover:text-blue-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Photos */}
            <PhotoUpload
              label={t('tasks.beforePhotos')}
              photos={form.photosBefore}
              onChange={photos => setForm(f => ({ ...f, photosBefore: photos }))}
            />

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

      {/* Task Detail Modal */}
      {selectedTask && viewTask && (
        <Modal title={viewTask.title} onClose={() => setSelectedTask(null)} size="lg">
          <div className="space-y-4">
            <p className="text-gray-600">{viewTask.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">{t('tasks.statusLabel')}</p>
                <StatusBadge status={viewTask.status} />
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">{t('tasks.estimatedTimeLabel')}</p>
                <p className="font-bold text-navy-900">{viewTask.estimatedMinutes} {t('common.minutes')}</p>
              </div>
            </div>

            {viewTask.videoLinks.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('tasks.howToVideosLabel')}</p>
                {viewTask.videoLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-1"
                  >
                    <LinkIcon size={13} />
                    {link}
                  </a>
                ))}
              </div>
            )}

            {viewTask.photosBefore.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('tasks.beforePhotosLabel')}</p>
                <div className="flex flex-wrap gap-2">
                  {viewTask.photosBefore.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}

            {viewTask.photosAfter.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('tasks.afterPhotosLabel')}</p>
                <div className="flex flex-wrap gap-2">
                  {viewTask.photosAfter.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
