import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import type { Language } from '../types'

const LANGS: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇲🇽' },
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'ht', label: 'HT', flag: '🇭🇹' },
  { code: 'pl', label: 'PL', flag: '🇵🇱' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { updateLanguage } = useAuth()

  const current = i18n.language as Language

  const handleChange = (lang: Language) => {
    i18n.changeLanguage(lang)
    updateLanguage(lang)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {LANGS.map(l => (
        <button
          key={l.code}
          onClick={() => handleChange(l.code)}
          title={l.label}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors ${
            current === l.code
              ? 'bg-brand text-white'
              : 'text-navy-300 hover:text-white hover:bg-navy-600'
          }`}
        >
          <span>{l.flag}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  )
}
