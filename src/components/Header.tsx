import { Bell, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useApp } from '../context/AppContext'
import { useState } from 'react'

interface HeaderProps {
  onMenuToggle: () => void
  title?: string
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
  const { alerts, markAlertRead } = useApp()
  const { t } = useTranslation()
  const [showAlerts, setShowAlerts] = useState(false)
  const unread = alerts.filter(a => !a.read)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="text-lg font-bold text-navy-900 hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowAlerts(s => !s)}
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Bell size={20} />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread.length}
            </span>
          )}
        </button>

        {showAlerts && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAlerts(false)} />
            <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-900">{t('dashboard.alerts')}</span>
                <span className="text-xs text-gray-500">{unread.length} {t('common.unread')}</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">{t('common.noAlerts')}</p>
                ) : (
                  alerts.map(alert => (
                    <button
                      key={alert.id}
                      onClick={() => { markAlertRead(alert.id); setShowAlerts(false) }}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        !alert.read ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!alert.read && (
                          <span className="mt-1.5 w-2 h-2 bg-brand rounded-full flex-shrink-0" />
                        )}
                        <p className={`text-sm ${!alert.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                          {alert.message}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 pl-4">
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
