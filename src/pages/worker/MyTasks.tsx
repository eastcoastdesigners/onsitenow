import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Camera, MapPin, CheckCircle2, Play, Clock,
  AlertTriangle, X, Wrench, Shield, PauseCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import Modal from '../../components/Modal'
import PhotoUpload from '../../components/PhotoUpload'
import YouTubePlayer from '../../components/YouTubePlayer'
import { TASK_LIBRARY } from '../../data/taskLibrary'

interface VideoState {
  accumulatedMs: number
  isPlaying: boolean
  playStart: number | null
}

export default function MyTasks() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const {
    tasks, updateTask, jobSites, checkIns, addCheckIn,
    addTimeEntry, updateTimeEntry, getActiveTimeEntry,
    addVideoWatchLog,
  } = useApp()

  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [photosAfter, setPhotosAfter] = useState<string[]>([])
  const photoRef = useRef<HTMLInputElement>(null)

  // Video watch state per task — persists across modal open/close
  const [videoStates, setVideoStates] = useState<Record<string, VideoState>>({})

  const myTasks = tasks.filter(t => t.assignedTo === currentUser?.id)
  const todayStr = new Date().toDateString()
  const todayCheckIn = checkIns.find(
    c => c.workerId === currentUser?.id && new Date(c.timestamp).toDateString() === todayStr
  )
  const activeEntry = currentUser ? getActiveTimeEntry(currentUser.id) : undefined
  const task = tasks.find(t => t.id === selectedTask)

  // Get video state for a task, defaulting to zero
  const getVideoState = (taskId: string): VideoState =>
    videoStates[taskId] ?? { accumulatedMs: 0, isPlaying: false, playStart: null }

  // Calculate effective elapsed minutes (raw - video time)
  const getAdjustedElapsed = (taskId: string): number | null => {
    if (!activeEntry || activeEntry.taskId !== taskId) return null
    const rawMs = Date.now() - new Date(activeEntry.clockIn).getTime()
    const vs = getVideoState(taskId)
    const currentVideoMs = vs.playStart ? Date.now() - vs.playStart : 0
    const adjusted = rawMs - vs.accumulatedMs - currentVideoMs
    return Math.max(0, Math.round(adjusted / 60000))
  }

  const handleVideoPlay = useCallback((taskId: string) => {
    setVideoStates(prev => {
      const vs = prev[taskId] ?? { accumulatedMs: 0, isPlaying: false, playStart: null }
      return { ...prev, [taskId]: { ...vs, isPlaying: true, playStart: Date.now() } }
    })
  }, [])

  const handleVideoPause = useCallback((taskId: string) => {
    setVideoStates(prev => {
      const vs = prev[taskId] ?? { accumulatedMs: 0, isPlaying: false, playStart: null }
      const added = vs.playStart ? Date.now() - vs.playStart : 0
      return { ...prev, [taskId]: { ...vs, isPlaying: false, playStart: null, accumulatedMs: vs.accumulatedMs + added } }
    })
  }, [])

  const handleVideoEnded = useCallback((taskId: string, taskTitle: string, videoId: string, durationSeconds: number) => {
    setVideoStates(prev => {
      const vs = prev[taskId] ?? { accumulatedMs: 0, isPlaying: false, playStart: null }
      const added = vs.playStart ? Date.now() - vs.playStart : 0
      return { ...prev, [taskId]: { ...vs, isPlaying: false, playStart: null, accumulatedMs: vs.accumulatedMs + added } }
    })
    if (currentUser && durationSeconds > 5) {
      addVideoWatchLog({
        taskId,
        taskTitle,
        workerId: currentUser.id,
        workerName: currentUser.name,
        videoId,
        watchedAt: new Date().toISOString(),
        durationSeconds,
      })
    }
  }, [currentUser, addVideoWatchLog])

  const getLocation = () => {
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGettingLocation(false) },
      () => { setLocation({ lat: 30.2672, lng: -97.7431 }); setGettingLocation(false) }
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
    const vs = getVideoState(task.id)
    const rawMs = Date.now() - new Date(activeEntry.clockIn).getTime()
    const videoMs = vs.accumulatedMs + (vs.playStart ? Date.now() - vs.playStart : 0)
    const adjustedMins = Math.max(1, Math.round((rawMs - videoMs) / 60000))
    const isOver = adjustedMins > task.estimatedMinutes
    updateTimeEntry(activeEntry.id, {
      clockOut: new Date().toISOString(),
      totalMinutes: adjustedMins,
      isOvertime: isOver,
    })
    updateTask(task.id, { status: 'completed', completedAt: new Date().toISOString(), photosAfter })
    setSelectedTask(null)
    setPhotosAfter([])
    // Reset video state for this task
    setVideoStates(prev => { const n = { ...prev }; delete n[task.id]; return n })
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

      {myTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-gray-400">{t('tasks.noTasks')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myTasks.map(task => {
            const site = jobSites.find(s => s.id === task.jobSiteId)
            const isActiveTask = activeEntry?.taskId === task.id
            const elapsed = getAdjustedElapsed(task.id)
            const isOver = elapsed !== null && elapsed > task.estimatedMinutes
            const vs = getVideoState(task.id)

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                  task.status === 'overdue' ? 'border-red-200' :
                  isActiveTask ? 'border-orange-300' : 'border-gray-100'
                }`}
              >
                <button onClick={() => setSelectedTask(task.id)} className="w-full p-4 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-navy-900 leading-tight">{task.title}</p>
                        {task.tutorialVideoId && (
                          <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md flex-shrink-0">📹</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={10} />
                        {site?.name} · {task.estimatedMinutes}m est
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  {isActiveTask && elapsed !== null && (
                    <div className={`mt-3 flex items-center gap-2 rounded-lg p-2 ${isOver ? 'bg-red-50' : 'bg-green-50'}`}>
                      {vs.isPlaying ? (
                        <>
                          <PauseCircle size={14} className="text-yellow-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-yellow-600">Timer paused — watching video</span>
                        </>
                      ) : (
                        <>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isOver ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-green-700'}`}>
                            {Math.floor(elapsed / 60)}h {elapsed % 60}m elapsed
                          </span>
                          {isOver && <span className="text-xs text-red-500">⚠️ over estimate</span>}
                        </>
                      )}
                    </div>
                  )}
                </button>

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
                  {task.tutorialVideoId && (
                    <button
                      onClick={() => setSelectedTask(task.id)}
                      className="flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      ▶ Watch Tutorial
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Task detail modal ─────────────────────────────────────────────────── */}
      {selectedTask && task && (
        <Modal title={task.title} onClose={() => setSelectedTask(null)} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <span className="text-sm text-gray-500">· {task.estimatedMinutes} {t('common.minutes')} est.</span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>

            {/* Tools needed */}
            {task.toolsNeeded && task.toolsNeeded.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
                  <Wrench size={12} /> Tools Needed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {task.toolsNeeded.map((tool, i) => (
                    <span key={i} className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">{tool}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety notes */}
            {task.safetyNotes && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs font-bold text-red-600 flex items-center gap-1 mb-1">
                  <Shield size={12} /> Safety — Read Before Starting
                </p>
                <p className="text-xs text-red-700 leading-relaxed">{task.safetyNotes}</p>
              </div>
            )}

            {/* YouTube tutorial */}
            {task.tutorialVideoId && (() => {
              const libTask = TASK_LIBRARY.find(l => l.videoId === task.tutorialVideoId)
              const vs = getVideoState(task.id)
              const isActiveForThis = activeEntry?.taskId === task.id
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-700">📹 How-To Tutorial</p>
                    {isActiveForThis && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        vs.isPlaying
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {vs.isPlaying ? '⏸ Timer paused' : '▶ Timer running'}
                      </span>
                    )}
                  </div>
                  <YouTubePlayer
                    videoId={task.tutorialVideoId}
                    searchQuery={libTask?.searchQuery ?? task.title + ' how to construction tutorial'}
                    taskTitle={task.title}
                    onPlay={() => handleVideoPlay(task.id)}
                    onPause={() => handleVideoPause(task.id)}
                    onEnded={(secs) => handleVideoEnded(task.id, task.title, task.tutorialVideoId!, secs)}
                  />
                  {isActiveForThis && vs.accumulatedMs > 0 && (
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                      {Math.round(vs.accumulatedMs / 60000)}m of video time excluded from your clock
                    </p>
                  )}
                </div>
              )
            })()}

            {/* Before photos */}
            {task.photosBefore.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">📸 Reference Photos</p>
                <div className="flex flex-wrap gap-2">
                  {task.photosBefore.map((src, i) => (
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  ))}
                </div>
              </div>
            )}

            {/* Clock out section */}
            {activeEntry?.taskId === task.id && (
              <>
                {/* Live timer in modal */}
                {(() => {
                  const vs = getVideoState(task.id)
                  const elapsed = getAdjustedElapsed(task.id) ?? 0
                  const isOver = elapsed > task.estimatedMinutes
                  return (
                    <div className={`rounded-xl p-3 flex items-center gap-3 ${isOver ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                      {vs.isPlaying ? (
                        <>
                          <PauseCircle size={18} className="text-yellow-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-yellow-700">Timer paused — watching tutorial</p>
                            <p className="text-xs text-yellow-600">Video time won't count against your clock</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Clock size={18} className={isOver ? 'text-red-500' : 'text-green-600'} />
                          <div>
                            <p className={`text-sm font-bold ${isOver ? 'text-red-700' : 'text-green-700'}`}>
                              {Math.floor(elapsed / 60)}h {elapsed % 60}m elapsed
                            </p>
                            <p className="text-xs text-gray-500">of {task.estimatedMinutes}m estimated</p>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()}

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

      {/* ── Check-in modal ────────────────────────────────────────────────────── */}
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
