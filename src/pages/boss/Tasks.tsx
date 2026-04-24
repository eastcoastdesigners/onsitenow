import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Link as LinkIcon, X, Clock, AlertTriangle, BookOpen, ChevronRight, Eye, Shield, Wrench } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import PhotoUpload from '../../components/PhotoUpload'
import type { TaskStatus, TaskPriority, LibraryTask } from '../../types'
import { TASK_LIBRARY, CATEGORIES, CATEGORY_ICONS } from '../../data/taskLibrary'

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
}

type ModalStep = 'choose' | 'library-category' | 'library-tasks' | 'form'

const BLANK_FORM = {
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
  libraryTaskId: undefined as string | undefined,
  tutorialVideoId: undefined as string | undefined,
  toolsNeeded: undefined as string[] | undefined,
  safetyNotes: undefined as string | undefined,
}

export default function Tasks() {
  const { t } = useTranslation()
  const { tasks, addTask, updateTask, users, jobSites, getTaskWatchLogs } = useApp()
  const { currentUser } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState<ModalStep>('choose')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [libraryCategory, setLibraryCategory] = useState<string | null>(null)

  const workers = users.filter(u => u.role === 'worker')

  const [form, setForm] = useState(BLANK_FORM)
  const [videoLinkInput, setVideoLinkInput] = useState('')

  const filtered = filterStatus === 'all'
    ? tasks
    : tasks.filter(t => t.status === filterStatus)

  const openModal = () => {
    setForm(BLANK_FORM)
    setModalStep('choose')
    setLibraryCategory(null)
    setVideoLinkInput('')
    setShowModal(true)
  }

  const selectLibraryTask = (lib: LibraryTask) => {
    setForm(f => ({
      ...f,
      title: lib.name,
      description: lib.description,
      estimatedMinutes: lib.estimatedMinutes,
      libraryTaskId: lib.id,
      tutorialVideoId: lib.videoId,
      toolsNeeded: lib.toolsNeeded,
      safetyNotes: lib.safetyNotes,
    }))
    setModalStep('form')
  }

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
  }

  const viewTask = tasks.find(t => t.id === selectedTask)

  const modalTitle =
    modalStep === 'choose' ? 'Add Task' :
    modalStep === 'library-category' ? '📚 Task Library' :
    modalStep === 'library-tasks' ? `${CATEGORY_ICONS[libraryCategory as keyof typeof CATEGORY_ICONS] ?? ''} ${libraryCategory}` :
    form.libraryTaskId ? 'Assign Library Task' : 'Custom Task'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-900">{t('tasks.title')}</h1>
        <button
          onClick={openModal}
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
            const watchLogs = getTaskWatchLogs(task.id)

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
                        {task.tutorialVideoId && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md flex-shrink-0">📹 Video</span>
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
                        {watchLogs.length > 0 && (
                          <span className="text-purple-600 font-medium">👁️ Watched {watchLogs.length}×</span>
                        )}
                        {hasPhotos > 0 && (
                          <span>📷 {hasPhotos}</span>
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

      {/* ── Add Task Modal ─────────────────────────────────────────────────────── */}
      {showModal && (
        <Modal title={modalTitle} onClose={() => setShowModal(false)} size="lg">

          {/* Step 1: Choose source */}
          {modalStep === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">How do you want to create this task?</p>
              <button
                onClick={() => setModalStep('library-category')}
                className="w-full flex items-center gap-4 p-4 border-2 border-purple-200 bg-purple-50 hover:border-purple-400 rounded-2xl text-left transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={22} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-navy-900">Pick from Task Library</p>
                  <p className="text-sm text-gray-500">20 pre-built tasks with how-to videos, tools & safety notes</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-purple-600" />
              </button>

              <button
                onClick={() => setModalStep('form')}
                className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 bg-gray-50 hover:border-gray-400 rounded-2xl text-left transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Plus size={22} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-navy-900">Custom Task</p>
                  <p className="text-sm text-gray-500">Create from scratch with your own title and instructions</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          )}

          {/* Step 2: Category grid */}
          {modalStep === 'library-category' && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Select a trade category:</p>
              <div className="grid grid-cols-3 gap-2.5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setLibraryCategory(cat); setModalStep('library-tasks') }}
                    className="flex flex-col items-center gap-1.5 p-3.5 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
                    <span className="text-xs font-bold text-navy-900">{cat}</span>
                    <span className="text-[10px] text-gray-400">
                      {TASK_LIBRARY.filter(t => t.category === cat).length} tasks
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModalStep('choose')}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Task list in category */}
          {modalStep === 'library-tasks' && libraryCategory && (
            <div>
              <div className="space-y-2.5">
                {TASK_LIBRARY.filter(t => t.category === libraryCategory).map(lib => (
                  <button
                    key={lib.id}
                    onClick={() => selectLibraryTask(lib)}
                    className="w-full text-left p-4 border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-navy-900 group-hover:text-purple-700">{lib.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{lib.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={11} />{lib.estimatedMinutes}m</span>
                          <span className="flex items-center gap-1 text-red-500">📹 Video included</span>
                          <span className="flex items-center gap-1">🔧 {lib.toolsNeeded.length} tools</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-purple-600 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setModalStep('library-category')}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                ← Back to categories
              </button>
            </div>
          )}

          {/* Step 4: Task form (custom or pre-filled) */}
          {modalStep === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {form.libraryTaskId && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
                  <BookOpen size={14} className="text-purple-600 flex-shrink-0" />
                  <span className="text-xs text-purple-700 font-medium">Pre-filled from Task Library — edit as needed</span>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, libraryTaskId: undefined, tutorialVideoId: undefined, toolsNeeded: undefined, safetyNotes: undefined }))}
                    className="ml-auto text-purple-400 hover:text-purple-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

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

              {/* Library extras: tools & safety */}
              {form.toolsNeeded && form.toolsNeeded.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div>
                    <p className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-1.5">
                      <Wrench size={12} /> Tools Needed
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {form.toolsNeeded.map((tool, i) => (
                        <span key={i} className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                  {form.safetyNotes && (
                    <div>
                      <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1">
                        <Shield size={12} /> Safety Notes
                      </p>
                      <p className="text-xs text-red-700 leading-relaxed">{form.safetyNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tutorial video */}
              {form.tutorialVideoId && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <span className="text-sm">📹</span>
                  <span className="text-xs text-red-700 font-medium">How-to tutorial video will be shown to worker</span>
                </div>
              )}

              {/* Extra video links */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Video Links</label>
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
                    <button type="button" onClick={() => setForm(f => ({ ...f, videoLinks: f.videoLinks.filter((_, j) => j !== i) }))}>
                      <X size={12} className="text-blue-400 hover:text-blue-600" />
                    </button>
                  </div>
                ))}
              </div>

              <PhotoUpload
                label={t('tasks.beforePhotos')}
                photos={form.photosBefore}
                onChange={photos => setForm(f => ({ ...f, photosBefore: photos }))}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStep(form.libraryTaskId ? 'library-tasks' : 'choose')}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50"
                >
                  ← Back
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                  {t('common.cancel')}
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-brand hover:bg-orange-600 text-white rounded-xl font-bold">
                  {t('common.save')}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* ── Task Detail Modal ─────────────────────────────────────────────────── */}
      {selectedTask && viewTask && (
        <Modal title={viewTask.title} onClose={() => setSelectedTask(null)} size="lg">
          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">{viewTask.description}</p>

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

            {/* Tools */}
            {viewTask.toolsNeeded && viewTask.toolsNeeded.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
                  <Wrench size={12} /> Tools Needed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {viewTask.toolsNeeded.map((tool, i) => (
                    <span key={i} className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{tool}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety */}
            {viewTask.safetyNotes && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1.5">
                  <Shield size={12} /> Safety Notes
                </p>
                <p className="text-xs text-red-700 leading-relaxed">{viewTask.safetyNotes}</p>
              </div>
            )}

            {/* Video accountability */}
            {viewTask.tutorialVideoId && (
              <div className="border border-purple-200 rounded-xl overflow-hidden">
                <div className="bg-purple-50 px-3 py-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                    <Eye size={13} /> Video Watch Log
                  </p>
                  {(() => {
                    const logs = getTaskWatchLogs(viewTask.id)
                    return logs.length > 0
                      ? <span className="text-xs text-purple-600 font-medium">Watched {logs.length} time{logs.length !== 1 ? 's' : ''}</span>
                      : <span className="text-xs text-gray-400">Not watched yet</span>
                  })()}
                </div>
                <div className="divide-y divide-gray-100">
                  {getTaskWatchLogs(viewTask.id).length === 0 ? (
                    <p className="text-xs text-gray-400 p-3">Worker has not watched this video yet.</p>
                  ) : (
                    getTaskWatchLogs(viewTask.id).map(log => (
                      <div key={log.id} className="px-3 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-navy-900">{log.workerName}</p>
                          <p className="text-[11px] text-gray-400">{new Date(log.watchedAt).toLocaleString()}</p>
                        </div>
                        <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {Math.round(log.durationSeconds / 60)}m watched
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Extra video links */}
            {viewTask.videoLinks.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('tasks.howToVideosLabel')}</p>
                {viewTask.videoLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline text-sm mb-1">
                    <LinkIcon size={13} />{link}
                  </a>
                ))}
              </div>
            )}

            {/* Before photos */}
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
          </div>
        </Modal>
      )}
    </div>
  )
}
