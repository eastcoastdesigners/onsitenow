import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HardHat, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { Language, BossPlan, WorkerPlan } from '../types'

export default function Register() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const defaultRole = (params.get('role') as 'boss' | 'worker') ?? 'boss'
  const defaultPlan = params.get('plan') as WorkerPlan | null

  const [role, setRole] = useState<'boss' | 'worker'>(defaultRole)
  const [bossPlan, setBossPlan] = useState<BossPlan>('growth')
  const [workerPlan, setWorkerPlan] = useState<WorkerPlan>(defaultPlan ?? 'free')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({
        name,
        email,
        password,
        role,
        plan: role === 'boss' ? bossPlan : workerPlan,
        companyName: role === 'boss' ? companyName : undefined,
        language: 'en' as Language,
      })
      navigate(role === 'boss' ? '/boss' : '/worker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const BOSS_PLANS: { key: BossPlan; price: string; popular?: boolean }[] = [
    { key: 'starter', price: '$29/mo' },
    { key: 'growth', price: '$59/mo', popular: true },
    { key: 'enterprise', price: '$99+/mo' },
  ]

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <HardHat size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl">OnSiteNow</span>
          </div>
          <h1 className="text-2xl font-black text-white">{t('auth.registerTitle')}</h1>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">{t('auth.iAmA')}</p>
            <div className="grid grid-cols-2 gap-3">
              {(['boss', 'worker'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    role === r
                      ? 'border-brand bg-orange-50 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r === 'boss' ? '👷 ' + t('auth.boss') : '🔨 ' + t('auth.worker')}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.name')}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="you@example.com"
              />
            </div>

            {role === 'boss' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth.companyName')}</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Torres Construction Co."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Min. 6 characters"
              />
            </div>

            {/* Plan selection */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">{t('auth.choosePlan')}</p>
              {role === 'boss' ? (
                <div className="space-y-2">
                  {BOSS_PLANS.map(({ key, price, popular }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBossPlan(key)}
                      className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl transition-all ${
                        bossPlan === key ? 'border-brand bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${bossPlan === key ? 'border-brand bg-brand' : 'border-gray-400'}`}>
                          {bossPlan === key && <Check size={10} className="text-white" />}
                        </div>
                        <span className="font-semibold text-sm text-gray-800 capitalize">{key}</span>
                        {popular && <span className="text-[10px] bg-brand text-white rounded-full px-2 py-0.5 font-bold">{t('common.popular')}</span>}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-navy-900">{price}</span>
                        <span className="text-xs text-gray-400 ml-1">· {t(`auth.planWorkers.${key}`)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(['free', 'pro'] as WorkerPlan[]).map(plan => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setWorkerPlan(plan)}
                      className={`py-3 px-4 border-2 rounded-xl text-sm font-semibold transition-all ${
                        workerPlan === plan ? 'border-brand bg-orange-50 text-brand' : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {plan === 'free'
                        ? `${t('landing.pricing.workerFree.name')} (${t('landing.pricing.workerFree.price')})`
                        : `${t('landing.pricing.workerPro.name')} (${t('landing.pricing.workerPro.price')}${t('landing.pricing.workerPro.period')})`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors mt-2"
            >
              {loading ? t('common.loading') : t('common.register')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-brand font-semibold hover:underline">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
