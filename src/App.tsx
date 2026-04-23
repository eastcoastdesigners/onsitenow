import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import './i18n'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'
import WorkerLayout from './components/WorkerLayout'
import BossDashboard from './pages/boss/Dashboard'
import JobSites from './pages/boss/JobSites'
import Workers from './pages/boss/Workers'
import Tasks from './pages/boss/Tasks'
import TimeTracking from './pages/boss/TimeTracking'
import ChangeOrders from './pages/boss/ChangeOrders'
import WorkerDashboard from './pages/worker/Dashboard'
import MyTasks from './pages/worker/MyTasks'
import TimeLog from './pages/worker/TimeLog'
import WorkerProfile from './pages/worker/Profile'

function BossRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'boss') return <Navigate to="/worker" replace />
  return <>{children}</>
}

function WorkerRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (currentUser.role !== 'worker') return <Navigate to="/boss" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/boss"
        element={
          <BossRoute>
            <Layout />
          </BossRoute>
        }
      >
        <Route index element={<BossDashboard />} />
        <Route path="sites" element={<JobSites />} />
        <Route path="workers" element={<Workers />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="time" element={<TimeTracking />} />
        <Route path="change-orders" element={<ChangeOrders />} />
      </Route>

      <Route
        path="/worker"
        element={
          <WorkerRoute>
            <WorkerLayout />
          </WorkerRoute>
        }
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="tasks" element={<MyTasks />} />
        <Route path="time" element={<TimeLog />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
