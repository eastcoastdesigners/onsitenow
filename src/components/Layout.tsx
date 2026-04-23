import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import Header from './Header'

const PAGE_TITLES: Record<string, string> = {
  '/boss': 'nav.dashboard',
  '/boss/sites': 'nav.jobSites',
  '/boss/workers': 'nav.workers',
  '/boss/tasks': 'nav.tasks',
  '/boss/time': 'nav.timeTracking',
  '/boss/change-orders': 'nav.changeOrders',
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const titleKey = Object.keys(PAGE_TITLES).find(k => pathname === k || pathname.startsWith(k + '/'))
  const title = titleKey ? t(PAGE_TITLES[titleKey]) : ''

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(s => !s)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
