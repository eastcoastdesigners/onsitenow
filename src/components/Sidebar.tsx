import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, MapPin, Users, ClipboardList,
  Clock, FileEdit, LogOut, HardHat, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const BOSS_NAV = [
  { to: '/boss', label: 'nav.dashboard', Icon: LayoutDashboard },
  { to: '/boss/sites', label: 'nav.jobSites', Icon: MapPin },
  { to: '/boss/workers', label: 'nav.workers', Icon: Users },
  { to: '/boss/tasks', label: 'nav.tasks', Icon: ClipboardList },
  { to: '/boss/time', label: 'nav.timeTracking', Icon: Clock },
  { to: '/boss/change-orders', label: 'nav.changeOrders', Icon: FileEdit },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-navy-900 z-30 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-5 border-b border-navy-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">OnSiteNow</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-navy-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-navy-400 text-xs capitalize">{currentUser?.plan} plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {BOSS_NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/boss'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-navy-300 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {t(label)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-700 space-y-3">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-navy-300 hover:bg-navy-700 hover:text-white text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            {t('common.logout')}
          </button>
        </div>
      </aside>
    </>
  )
}
