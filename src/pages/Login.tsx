import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HardHat, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const users = JSON.parse(localStorage.getItem('onsiteNow_users') || '[]')
      const user = users.find((u: { email: string }) => u.email === email)
      navigate(user?.role === 'boss' ? '/boss' : '/worker')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center">
              <HardHat size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-2xl">OnSiteNow</span>
          </div>
          <h1 className="text-2xl font-black text-white">{t('auth.loginTitle')}</h1>
          <p className="text-navy-400 mt-1">{t('auth.loginSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Demo hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
            <p className="text-xs text-blue-700 leading-relaxed">{t('auth.demoHint')}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('common.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {loading ? t('common.loading') : t('common.login')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-brand font-semibold hover:underline">
              {t('common.register')}
            </Link>
          </p>
        </div>

        <p className="text-center mt-4">
          <Link to="/" className="text-navy-400 hover:text-white text-sm transition-colors">
            {t('auth.backToHome')}
          </Link>
        </p>
      </div>
    </div>
  )
}
