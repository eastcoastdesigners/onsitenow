import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  MapPin, ClipboardList, Camera, Clock, FileEdit, Globe,
  Check, HardHat, ChevronRight, Shield, Star, Zap
} from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  if (currentUser) {
    navigate(currentUser.role === 'boss' ? '/boss' : '/worker')
    return null
  }

  const features = [
    { key: 'gps', Icon: MapPin, color: 'bg-blue-500' },
    { key: 'tasks', Icon: ClipboardList, color: 'bg-orange-500' },
    { key: 'photos', Icon: Camera, color: 'bg-green-500' },
    { key: 'time', Icon: Clock, color: 'bg-purple-500' },
    { key: 'changeOrders', Icon: FileEdit, color: 'bg-red-500' },
    { key: 'languages', Icon: Globe, color: 'bg-teal-500' },
  ]

  const bossPlanKeys = ['starter', 'growth', 'enterprise'] as const
  const testimonialKeys = ['t1', 't2', 't3'] as const

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-navy-700">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">OnSiteNow</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LanguageSwitcher />
            <button
              onClick={() => navigate('/login')}
              className="text-navy-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-navy-700 transition-colors"
            >
              {t('common.login')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-brand hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
            >
              {t('common.register')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-brand/20 border border-brand/30 rounded-full px-4 py-1.5 mb-6">
              <Zap size={14} className="text-brand" />
              <span className="text-brand text-sm font-semibold">{t('landing.badge')}</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl text-navy-300 mb-8 leading-relaxed max-w-2xl">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center justify-center gap-2 bg-brand hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-orange-500/20"
              >
                {t('landing.hero.cta')}
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => navigate('/register?role=worker')}
                className="flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-600 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors border border-navy-600"
              >
                {t('landing.hero.workerCta')}
              </button>
            </div>
            <p className="text-navy-500 text-sm mt-4">{t('landing.noCredit')}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-navy-800 bg-navy-800/50">
          <div className="max-w-6xl mx-auto px-4 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '4,200+', key: 'contractors' },
              { value: '38,000+', key: 'workers' },
              { value: '1.2M+', key: 'tasks' },
              { value: '99.9%', key: 'uptime' },
            ].map(stat => (
              <div key={stat.key} className="text-center">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-navy-400 text-sm">{t(`landing.stats.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-navy-900 mb-4">{t('landing.features.title')}</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ key, Icon, color }) => (
              <div key={key} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {t(`landing.features.${key}.title`)}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {t(`landing.features.${key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Boss */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-navy-900 mb-3">{t('landing.pricing.title')}</h2>
            <p className="text-xl text-gray-500">{t('landing.pricing.subtitle')}</p>
          </div>

          <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">{t('landing.pricing.bossTitle')}</h3>
          <div className="grid lg:grid-cols-3 gap-6 mb-14">
            {bossPlanKeys.map(key => {
              const features = t(`landing.pricing.${key}.features`, { returnObjects: true }) as string[]
              const popular = key === 'growth'
              return (
                <div
                  key={key}
                  className={`relative rounded-2xl p-7 border-2 ${
                    popular ? 'border-brand shadow-xl shadow-orange-100' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-brand text-white text-xs font-bold px-4 py-1 rounded-full">
                        {t(`landing.pricing.${key}.badge`)}
                      </span>
                    </div>
                  )}
                  <div className="mb-5">
                    <p className="font-bold text-navy-900 text-lg">{t(`landing.pricing.${key}.name`)}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black text-navy-900">{t(`landing.pricing.${key}.price`)}</span>
                      <span className="text-gray-400">{t(`landing.pricing.${key}.period`)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t(`landing.pricing.${key}.workers`)}</p>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {Array.isArray(features) && features.map((f: string) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <Check size={15} className="text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate('/register')}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                      popular ? 'bg-brand hover:bg-orange-600 text-white' : 'bg-navy-900 hover:bg-navy-700 text-white'
                    }`}
                  >
                    {t('landing.pricing.getStarted')}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Worker pricing */}
          <h3 className="text-2xl font-bold text-navy-900 mb-6 text-center">{t('landing.pricing.workerTitle')}</h3>
          <div className="grid lg:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {(['workerFree', 'workerPro'] as const).map(key => (
              <div
                key={key}
                className={`rounded-2xl p-7 border-2 relative ${
                  key === 'workerPro' ? 'border-brand shadow-xl shadow-orange-100' : 'border-gray-100'
                }`}
              >
                {key === 'workerPro' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand text-white text-xs font-bold px-4 py-1 rounded-full">
                      {t('landing.pricing.workerPro.badge')}
                    </span>
                  </div>
                )}
                <p className="font-bold text-navy-900 text-lg">{t(`landing.pricing.${key}.name`)}</p>
                <div className="flex items-baseline gap-1 mt-2 mb-1">
                  <span className="text-4xl font-black text-navy-900">{t(`landing.pricing.${key}.price`)}</span>
                  <span className="text-gray-400">{t(`landing.pricing.${key}.period`)}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">{t(`landing.pricing.${key}.desc`)}</p>
                <button
                  onClick={() => navigate(`/register?role=worker&plan=${key === 'workerFree' ? 'free' : 'pro'}`)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    key === 'workerPro' ? 'bg-brand hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-navy-900'
                  }`}
                >
                  {t('landing.pricing.getStarted')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white text-center mb-10">{t('landing.testimonials.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonialKeys.map(key => (
              <div key={key} className="bg-navy-800 rounded-2xl p-6 border border-navy-700">
                <div className="flex mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-brand fill-brand" />)}
                </div>
                <p className="text-navy-200 text-sm leading-relaxed mb-4">"{t(`landing.testimonials.${key}.text`)}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t(`landing.testimonials.${key}.name`)}</p>
                  <p className="text-navy-400 text-xs">{t(`landing.testimonials.${key}.co`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Shield size={40} className="text-white/80 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">{t('landing.cta.title')}</h2>
          <p className="text-xl text-white/80 mb-8">{t('landing.cta.subtitle')}</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white hover:bg-gray-50 text-brand font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl"
          >
            {t('landing.cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-500 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
              <HardHat size={13} className="text-white" />
            </div>
            <span className="text-white font-bold">OnSiteNow</span>
            <span className="text-navy-600">{t('landing.procircle')}</span>
          </div>
          <p className="text-sm">{t('landing.copyright')}</p>
        </div>
      </footer>
    </div>
  )
}
