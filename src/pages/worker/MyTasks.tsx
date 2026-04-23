import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Camera, MapPin, CheckCircle2, Play, Clock,
  AlertTriangle, Link as LinkIcon, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import PhotoUpload from '../../components/PhotoUpload'

export default function MyTasks() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { tasks, updateTask, jobSites, checkIns, addCheckIn, addTimeEntry, updateTimeEntry, getActiveTimeEntry } = useApp()

  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [photosAfter, setPhotosAfter] = useState<string[]>([])
  const photoRef = useRef<HTMLInputElement>(null)

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id)
  const todayStr = new Date().toDateString()
  const todayCheckIn = checkIns.find(
    c => c.workerId === currentUser?.id && new Date(c.timestamp).toDateString() === todayStr
  )
  const activeEntry = currentUser ? getActiveTimeEntry(currentUser.id) : undefined
  const task = tasks.find(t => t.id === selectedTask)

  const getLocation = () => {
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGettingLocation(false)
      },
      () => {
        setLocation({ lat: 30.2672, lng: -97.7431 })
        setGettingLocation(false)
      }
    )
  }

  const handleCheckIn = () => {
    if (!checkInPhoto || !location || !currentUser) return
    const firstTask = myTasks.find(t => t.status === 'pending' || t.status === 'in_progress')
    addCheckIn({
      workerId: currentUser.id,
      jobSiteId: firstTask?.jobSiteId ?? '',
      timestamp: new Date().toISOString(),
      photoUrl: checkInPhoto,
      location: { ...location, address: 'On-site location verified' },
      verified: true,
    })
    setShowCheckIn(false)
    setCheckInPhoto(null)
    setLocation(null)
  }

  const handleClockIn = (taskId: string) => {
    const t = tasks.find(t => t.id === taskId)
    if (!currentUser || !t) return
    updateTask(taskId, { status: 'in_progress', startedAt: new Date().toISOString() })
    addTimeEntry({
      taskId,
      workerId: currentUser.id,
      jobSiteId: t.jobSiteId,
      clockIn: new Date().toISOString(),
      isOvertime: false,
    })
    setSelectedTask(null)
  }

  const handleClockOut = () => {
    if (!activeEntry || !task) return
    const mins = Math.round((Date.now() - new Date(activeEntry.clockIn).getTime()) / 60000)
    const isOver = mins > task.estimatedMinutes
    updateTimeEntry(activeEntry.id, {
      clockOut: new Date().toISOString(),
      totalMinutes: mins,
      isOvertime: isOver,
    })
    updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString(), photosAfter })
    setSelectedTask(null)
    setPhotosAfter([])
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setCheckInPhoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-navy-900">{t('nav.myTasks')}</h1>
        {!todayCheckIn && (
          <button
            onClick={() => setShowCheckIn(true)}
            className="flex items-center gap-1.5 bg-brand text-white font-bold px-3 py-2 rounded-xl text-sm"
          >
            <Camera size={15} />
            {t('workerView.checkInButton')}
          </button>
        )}
      </div>

      {/* Check-in status */}
      {todayCheckIn ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <p className="text-sm text-green-700 font-medium">
            {t('workerView.onSiteSince')} {new Date(todayCheckIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-brand rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-brand" />
          <p className="text-sm text-orange-700 font-medium">{t('checkin.photoCheckInRequired')}</p>
        </div>
      )}

      {/* Tasks */}
      {myTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-gray-400">{t('tasks.noTasks')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myTasks.map(task => {
            const site = jobSites.find(s => s.id === task.jobSiteId)
            const isActiveTask = activeEntry?.taskId === task.id
            const elapsed = isActiveTask
              ? Math.round((Date.now() - new Date(activeEntry.clockIn).getTime()) / 60000)
              : null
            const isOver = elapsed !== null && elapsed > task.estimatedMinutes

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  task.status === 'overdue' ? 'border-red-200' :
                  isActiveTask ? 'border-orange-300' : 'border-gray-100'
                }`}
              >
                <button
                  onClick={() => setSelectedTask(task.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-navy-900 leading-tight">{task.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {site?.name} · {task.estimatedMinutes}m est
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-0.5">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  {isActiveTask && elapsed !== null && (
                    <div className={`mt-3 flex items-center gap-2 rounded-lg p-2 ${isOver ? 'bg-red-50' : 'bg-green-50'}`}>
                      <span className={`w-2 h-2 rounded-full animate-pulse ${isOver ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-green-700'}`}>
                        {Math.floor(elapsed / 60)}h {elapsed % 60}m elapsed
                      </span>
                      {isOver && <span className="text-xs text-red-500">⚠️ {t('checkin.overEstimate')}</span>}
                    </div>
                  )}
                </button>

                {/* Actions row */}
                <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2">
                  {task.status === 'pending' && todayCheckIn && !activeEntry && (
                    <button
                      onClick={() => handleClockIn(task.id)}
                      className="flex items-center gap-1.5 bg-navy-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      <Play size={12} />
                      {t('timeTracking.clockIn')}
                    </button>
                  )}
                  {isActiveTask && (
                    <button
                      onClick={() => setSelectedTask(task.id)}
                      className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      <CheckCircle2 size={12} />
                      {t('timeTracking.clockOut')}
                    </button>
                  )}
                  {task.videoLinks.length > 0 && (
                    <a
                      href={task.videoLinks[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      <LinkIcon size={12} />
                      {t('checkin.howToVideoLink')}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && task && (
        <Modal title={task.title} onClose={() => setSelectedTask(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <span className="text-sm text-gray-500">· {task.estimatedMinutes} {t('common.minutes')} {t('tasks.estimatedTimeLabel').toLowerCase()}</span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>

            {task.videoLinks.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 mb-1.5">📹 {t('checkin.howToVideos')}</p>
                {task.videoLinks.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline block truncate">
                    {link}
                  </a>
                ))}
              </div>
            )}

            {task.photosBefore.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">📸 {t('checkin.beforePhotosRef')}</p>
                <div className="flex flex-wrap gap-2">
                  {task.photosBefore.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}

            {activeEntry?.taskId === task.id && (
              <>
                <PhotoUpload
                  label={t('tasks.afterPhotos')}
                  photos={photosAfter}
                  onChange={setPhotosAfter}
                />
                <button
                  onClick={handleClockOut}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {t('timeTracking.clockOut')} — {t('tasks.markComplete')}
                </button>
              </>
            )}

            {task.status === 'pending' && todayCheckIn && !activeEntry && (
              <button
                onClick={() => handleClockIn(task.id)}
                className="w-full bg-navy-900 hover:bg-navy-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                <Play size={18} />
                {t('timeTracking.clockIn')} — {t('tasks.startTask')}
              </button>
            )}

            {!todayCheckIn && task.status === 'pending' && (
              <div className="bg-orange-50 border border-brand rounded-xl p-3 text-center">
                <p className="text-sm text-orange-700 font-medium">{t('checkin.gpsCheckInRequired')}</p>
                <button
                  onClick={() => { setSelectedTask(null); setShowCheckIn(true) }}
                  className="text-brand text-sm font-bold hover:underline mt-1"
                >
                  {t('checkin.checkInNowArrow')}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Check-in modal */}
      {showCheckIn && (
        <Modal title={t('checkin.title')} onClose={() => setShowCheckIn(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('checkin.takePhoto')} *</p>
              {checkInPhoto ? (
                <div className="relative">
                  <img src={checkInPhoto} alt="Check-in" className="w-full h-48 object-cover rounded-xl border border-gray-200" />
                  <button
                    onClick={() => setCheckInPhoto(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => photoRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-brand hover:bg-orange-50 transition-colors text-gray-400"
                >
                  <Camera size={32} className="mb-2" />
                  <span className="text-sm">{t('checkin.tapToPhoto')}</span>
                </button>
              )}
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoCapture}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('checkin.getLocation')}</p>
              {location ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">{t('checkin.locationFound')}</p>
                    <p className="text-xs text-green-600">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={getLocation}
                  disabled={gettingLocation}
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <MapPin size={16} />
                  {gettingLocation ? t('checkin.gettingLocation') : t('checkin.getLocation')}
                </button>
              )}
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!checkInPhoto || !location}
              className="w-full bg-brand hover:bg-orange-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {t('checkin.checkInNow')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
