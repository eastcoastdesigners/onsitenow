import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, CheckSquare, Clock, User, LogOut, HardHat } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

const WORKER_NAV = [
  { to: '/worker', label: 'nav.dashboard', Icon: LayoutDashboard },
  { to: '/worker/tasks', label: 'nav.myTasks', Icon: CheckSquare },
  { to: '/worker/time', label: 'nav.timeLog', Icon: Clock },
  { to: '/worker/profile', label: 'nav.profile', Icon: User },
]

export default function WorkerLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-navy-900 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center">
            <HardHat size={15} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">OnSiteNow</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-navy-600 flex items-center justify-center text-white font-bold text-xs">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="text-navy-400 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {WORKER_NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/worker'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-brand' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-brand' : ''} />
                <span className="mt-0.5">{t(label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
