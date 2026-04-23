import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X, Shield, Award, Check, Star, Edit2, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { generateId } from '../../utils/storage'
import type { Certification, License } from '../../types'

export default function WorkerProfile() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const { workerProfiles, updateWorkerProfile } = useApp()

  const profile = workerProfiles.find(p => p.userId === currentUser?.id)

  const [editingBio, setEditingBio] = useState(false)
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [newSkill, setNewSkill] = useState('')
  const [showCertForm, setShowCertForm] = useState(false)
  const [showLicForm, setShowLicForm] = useState(false)

  const [certForm, setCertForm] = useState({ name: '', issuer: '', issueDate: '', expiryDate: '' })
  const [licForm, setLicForm] = useState({ type: '', number: '', state: '', expiryDate: '' })

  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-400 py-20">
        Profile not found.
      </div>
    )
  }

  const save = (updates: Partial<typeof profile>) =>
    updateWorkerProfile({ ...profile, ...updates })

  const addSkill = () => {
    if (!newSkill.trim()) return
    save({ skills: [...profile.skills, newSkill.trim()] })
    setNewSkill('')
  }

  const removeSkill = (s: string) =>
    save({ skills: profile.skills.filter(sk => sk !== s) })

  const saveBio = () => {
    save({ bio })
    setEditingBio(false)
  }

  const addCert = (e: React.FormEvent) => {
    e.preventDefault()
    const cert: Certification = { id: generateId('cert'), ...certForm, verified: false }
    save({ certifications: [...profile.certifications, cert] })
    setCertForm({ name: '', issuer: '', issueDate: '', expiryDate: '' })
    setShowCertForm(false)
  }

  const removeCert = (id: string) =>
    save({ certifications: profile.certifications.filter(c => c.id !== id) })

  const addLicense = (e: React.FormEvent) => {
    e.preventDefault()
    const lic: License = { id: generateId('lic'), ...licForm }
    save({ licenses: [...profile.licenses, lic] })
    setLicForm({ type: '', number: '', state: '', expiryDate: '' })
    setShowLicForm(false)
  }

  const removeLicense = (id: string) =>
    save({ licenses: profile.licenses.filter(l => l.id !== id) })

  return (
    <div className="p-4 space-y-5">
      <h1 className="text-xl font-black text-navy-900">{t('profile.title')}</h1>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-700 flex items-center justify-center text-white font-black text-2xl">
            {currentUser?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-black text-navy-900">{currentUser?.name}</h2>
            <p className="text-gray-500 text-sm">{currentUser?.email}</p>
            <p className="text-gray-400 text-sm">{currentUser?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              {currentUser?.plan === 'pro' && (
                <span className="text-[11px] bg-brand text-white rounded-full px-2.5 py-0.5 font-bold">{t('common.pro')}</span>
              )}
              {profile.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-gray-600">{profile.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-black text-navy-900">{profile.yearsExperience}</p>
            <p className="text-xs text-gray-500">{t('profile.yearsExperience')}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-navy-900">{profile.certifications.length + profile.licenses.length}</p>
            <p className="text-xs text-gray-500">{t('profile.credentials')}</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-navy-900">{t('profile.bio')}</h3>
          <button
            onClick={() => editingBio ? saveBio() : setEditingBio(true)}
            className="text-brand text-xs font-semibold flex items-center gap-1"
          >
            {editingBio ? <><Save size={12} /> {t('profile.saveLabel')}</> : <><Edit2 size={12} /> {t('profile.editLabel')}</>}
          </button>
        </div>
        {editingBio ? (
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            placeholder="Tell your boss about your skills and experience..."
          />
        ) : (
          <p className="text-gray-600 text-sm">{profile.bio || t('profile.noBio')}</p>
        )}
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-navy-900 mb-3">{t('workers.skills')}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.skills.map(skill => (
            <span key={skill} className="flex items-center gap-1.5 bg-navy-100 text-navy-700 text-sm font-semibold px-3 py-1 rounded-full">
              {skill}
              <button onClick={() => removeSkill(skill)} className="text-navy-400 hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
          {profile.skills.length === 0 && <p className="text-gray-400 text-sm">{t('profile.noSkills')}</p>}
        </div>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder={t('profile.addSkillPlaceholder')}
          />
          <button onClick={addSkill} className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-navy-900">{t('workers.certifications')}</h3>
          <button
            onClick={() => setShowCertForm(s => !s)}
            className="flex items-center gap-1 text-brand text-sm font-semibold"
          >
            <Plus size={14} />
            {t('profile.addCertification')}
          </button>
        </div>

        {showCertForm && (
          <form onSubmit={addCert} className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
            <input
              required
              value={certForm.name}
              onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Certification name (e.g. OSHA 30-Hour)"
            />
            <input
              required
              value={certForm.issuer}
              onChange={e => setCertForm(f => ({ ...f, issuer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={t('profile.issuer')}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">{t('profile.issueDate')}</label>
                <input
                  type="date"
                  required
                  value={certForm.issueDate}
                  onChange={e => setCertForm(f => ({ ...f, issueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">{t('profile.expiryDate')}</label>
                <input
                  type="date"
                  required
                  value={certForm.expiryDate}
                  onChange={e => setCertForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCertForm(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">{t('common.cancel')}</button>
              <button type="submit" className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-bold">{t('common.save')}</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {profile.certifications.map(cert => (
            <div key={cert.id} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
              <div className="flex items-center gap-2">
                <Award size={14} className="text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.issuer} · {t('profile.expires')} {new Date(cert.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cert.verified && <Check size={14} className="text-green-500" />}
                <button onClick={() => removeCert(cert.id)} className="text-gray-300 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {profile.certifications.length === 0 && <p className="text-gray-400 text-sm">{t('profile.noCerts')}</p>}
        </div>
      </div>

      {/* Licenses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-navy-900">{t('workers.licenses')}</h3>
          <button
            onClick={() => setShowLicForm(s => !s)}
            className="flex items-center gap-1 text-brand text-sm font-semibold"
          >
            <Plus size={14} />
            {t('profile.addLicense')}
          </button>
        </div>

        {showLicForm && (
          <form onSubmit={addLicense} className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
            <input
              required
              value={licForm.type}
              onChange={e => setLicForm(f => ({ ...f, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={t('profile.licenseType')}
            />
            <input
              required
              value={licForm.number}
              onChange={e => setLicForm(f => ({ ...f, number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder={t('profile.licenseNumber')}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                required
                value={licForm.state}
                onChange={e => setLicForm(f => ({ ...f, state: e.target.value }))}
                maxLength={2}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder={t('profile.state')}
              />
              <div>
                <label className="text-xs text-gray-500">{t('profile.expiryDate')}</label>
                <input
                  type="date"
                  required
                  value={licForm.expiryDate}
                  onChange={e => setLicForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowLicForm(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">{t('common.cancel')}</button>
              <button type="submit" className="flex-1 py-2 bg-brand text-white rounded-lg text-sm font-bold">{t('common.save')}</button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {profile.licenses.map(lic => (
            <div key={lic.id} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{lic.type}</p>
                  <p className="text-xs text-gray-500">{lic.state} #{lic.number} · {t('profile.expires')} {new Date(lic.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => removeLicense(lic.id)} className="text-gray-300 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          ))}
          {profile.licenses.length === 0 && <p className="text-gray-400 text-sm">{t('profile.noLicenses')}</p>}
        </div>
      </div>
    </div>
  )
}
