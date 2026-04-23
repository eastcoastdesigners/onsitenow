import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Star, Shield, Award, User, Phone, Check } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { generateId } from '../../utils/storage'
import type { User as UserType, WorkerProfile } from '../../types'

export default function Workers() {
  const { t } = useTranslation()
  const { users, workerProfiles, addWorker, tasks } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<UserType | null>(null)

  const workers = users.filter(u => u.role === 'worker')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'worker123',
  })

  const getProfile = (id: string) => workerProfiles.find(p => p.userId === id)

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault()
    const id = generateId('worker')
    const newUser: UserType = {
      id,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: 'worker',
      plan: 'free',
      language: 'en',
      createdAt: new Date().toISOString(),
    }
    const newProfile: WorkerProfile = {
      userId: id,
      skills: [],
      certifications: [],
      licenses: [],
      yearsExperience: 0,
      rating: 0,
    }
    addWorker(newUser, newProfile)
    setShowModal(false)
    setForm({ name: '', email: '', phone: '', password: 'worker123' })
  }

  const workerProfile = selectedWorker ? getProfile(selectedWorker.id) : null
  const workerTasks = selectedWorker ? tasks.filter(t => t.assignedTo === selectedWorker.id) : []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-navy-900">{t('workers.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} />
          {t('workers.addWorker')}
        </button>
      </div>

      {workers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <User size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('workers.noWorkers')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map(worker => {
            const profile = getProfile(worker.id)
            const wTasks = tasks.filter(t => t.assignedTo === worker.id)
            const completedCount = wTasks.filter(t => t.status === 'completed').length

            return (
              <button
                key={worker.id}
                onClick={() => setSelectedWorker(worker)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 text-left"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-navy-700 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {worker.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-navy-900">{worker.name}</p>
                    <p className="text-xs text-gray-400">{worker.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {worker.plan === 'pro' ? (
                        <span className="text-[10px] bg-brand text-white rounded-full px-2 py-0.5 font-bold">{t('common.pro')}</span>
                      ) : (
                        <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-bold">{t('common.free')}</span>
                      )}
                    </div>
                  </div>
                  {profile && profile.rating > 0 && (
                    <div className="ml-auto flex items-center gap-0.5">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-semibold text-gray-600">{profile.rating}</span>
                    </div>
                  )}
                </div>

                {profile && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {profile.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[11px] bg-navy-50 text-navy-700 rounded-full px-2 py-0.5 font-medium">
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 3 && (
                      <span className="text-[11px] text-gray-400">+{profile.skills.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  {profile && (
                    <>
                      <span className="flex items-center gap-1">
                        <Award size={11} />
                        {profile.certifications.length} {t('workers.certsCount')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={11} />
                        {profile.licenses.length} {t('workers.licensesCount')}
                      </span>
                    </>
                  )}
                  <span className="ml-auto">
                    {completedCount}/{wTasks.length} {t('workers.tasksCount')}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Add Worker Modal */}
      {showModal && (
        <Modal title={t('workers.addWorker')} onClose={() => setShowModal(false)}>
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.name')} *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.email')} *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="worker@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.phone')}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
              {t('auth.workerSignIn')} <strong>worker123</strong>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                {t('common.cancel')}
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-brand hover:bg-orange-600 text-white rounded-xl font-bold">
                {t('workers.addWorker')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <Modal title={t('workers.workerDetails')} onClose={() => setSelectedWorker(null)} size="lg">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center text-white font-black text-2xl">
                {selectedWorker.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-navy-900">{selectedWorker.name}</h3>
                <p className="text-gray-500 flex items-center gap-1.5">
                  <Phone size={13} />
                  {selectedWorker.phone || t('common.noPhone')}
                </p>
                <p className="text-gray-400 text-sm">{selectedWorker.email}</p>
              </div>
              {workerProfile?.rating ? (
                <div className="ml-auto flex items-center gap-1 bg-yellow-50 rounded-xl px-3 py-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-yellow-700">{workerProfile.rating}</span>
                </div>
              ) : null}
            </div>

            {workerProfile?.bio && (
              <p className="text-gray-600 text-sm bg-gray-50 rounded-xl p-3">{workerProfile.bio}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-0.5">{t('workers.experienceLabel')}</p>
                <p className="font-bold text-navy-900">{workerProfile?.yearsExperience ?? 0} {t('profile.yearsExperience')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-0.5">{t('workers.tasksCompleted')}</p>
                <p className="font-bold text-navy-900">{workerTasks.filter(t => t.status === 'completed').length} / {workerTasks.length}</p>
              </div>
            </div>

            {workerProfile && workerProfile.skills.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('workers.skills')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {workerProfile.skills.map(s => (
                    <span key={s} className="bg-navy-100 text-navy-700 text-xs font-semibold px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {workerProfile && workerProfile.certifications.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('workers.certifications')}</p>
                <div className="space-y-2">
                  {workerProfile.certifications.map(cert => (
                    <div key={cert.id} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{cert.name}</p>
                        <p className="text-xs text-gray-500">{cert.issuer} · {t('profile.expires')} {new Date(cert.expiryDate).toLocaleDateString()}</p>
                      </div>
                      {cert.verified && <Check size={16} className="text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workerProfile && workerProfile.licenses.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('workers.licenses')}</p>
                <div className="space-y-2">
                  {workerProfile.licenses.map(lic => (
                    <div key={lic.id} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{lic.type}</p>
                        <p className="text-xs text-gray-500">{lic.state} #{lic.number} · {t('profile.expires')} {new Date(lic.expiryDate).toLocaleDateString()}</p>
                      </div>
                      <Shield size={16} className="text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {workerTasks.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">{t('workers.assignedTasks')}</p>
                <div className="space-y-1.5">
                  {workerTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-sm text-gray-700 truncate">{task.title}</p>
                      <span className={`text-xs font-semibold ml-2 ${
                        task.status === 'completed' ? 'text-green-600' :
                        task.status === 'overdue' ? 'text-red-500' :
                        task.status === 'in_progress' ? 'text-orange-500' : 'text-gray-400'
                      }`}>{task.status.replace('_', ' ')}</span>
                    </div>
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
