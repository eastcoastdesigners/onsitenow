import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type {
  User, JobSite, Task, TimeEntry, CheckIn, ChangeOrder, WorkerProfile, Alert
} from '../types'
import { storage, generateId } from '../utils/storage'
import {
  MOCK_USERS, MOCK_JOB_SITES, MOCK_TASKS, MOCK_TIME_ENTRIES,
  MOCK_CHECKINS, MOCK_CHANGE_ORDERS, MOCK_WORKER_PROFILES, MOCK_ALERTS
} from '../utils/mockData'

interface AppContextType {
  users: User[]
  jobSites: JobSite[]
  tasks: Task[]
  timeEntries: TimeEntry[]
  checkIns: CheckIn[]
  changeOrders: ChangeOrder[]
  workerProfiles: WorkerProfile[]
  alerts: Alert[]
  addJobSite: (site: Omit<JobSite, 'id' | 'createdAt'>) => void
  updateJobSite: (id: string, updates: Partial<JobSite>) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  addCheckIn: (checkin: Omit<CheckIn, 'id'>) => void
  addChangeOrder: (order: Omit<ChangeOrder, 'id' | 'createdAt'>) => void
  updateChangeOrder: (id: string, updates: Partial<ChangeOrder>) => void
  updateWorkerProfile: (profile: WorkerProfile) => void
  addWorker: (user: User, profile: WorkerProfile) => void
  markAlertRead: (id: string) => void
  getWorkerById: (id: string) => User | undefined
  getJobSiteById: (id: string) => JobSite | undefined
  getTaskById: (id: string) => Task | undefined
  getActiveTimeEntry: (workerId: string) => TimeEntry | undefined
}

const AppContext = createContext<AppContextType | null>(null)

function loadOrInit<T>(key: string, defaults: T[]): T[] {
  return storage.get<T[]>(key) ?? (storage.set(key, defaults), defaults)
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadOrInit('users', MOCK_USERS))
  const [jobSites, setJobSites] = useState<JobSite[]>(() => loadOrInit('jobSites', MOCK_JOB_SITES))
  const [tasks, setTasks] = useState<Task[]>(() => loadOrInit('tasks', MOCK_TASKS))
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => loadOrInit('timeEntries', MOCK_TIME_ENTRIES))
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => loadOrInit('checkIns', MOCK_CHECKINS))
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>(() => loadOrInit('changeOrders', MOCK_CHANGE_ORDERS))
  const [workerProfiles, setWorkerProfiles] = useState<WorkerProfile[]>(() => loadOrInit('workerProfiles', MOCK_WORKER_PROFILES))
  const [alerts, setAlerts] = useState<Alert[]>(() => loadOrInit('alerts', MOCK_ALERTS))

  useEffect(() => { storage.set('jobSites', jobSites) }, [jobSites])
  useEffect(() => { storage.set('tasks', tasks) }, [tasks])
  useEffect(() => { storage.set('timeEntries', timeEntries) }, [timeEntries])
  useEffect(() => { storage.set('checkIns', checkIns) }, [checkIns])
  useEffect(() => { storage.set('changeOrders', changeOrders) }, [changeOrders])
  useEffect(() => { storage.set('workerProfiles', workerProfiles) }, [workerProfiles])
  useEffect(() => { storage.set('alerts', alerts) }, [alerts])
  useEffect(() => { storage.set('users', users) }, [users])

  const addJobSite = (site: Omit<JobSite, 'id' | 'createdAt'>) => {
    const newSite: JobSite = { ...site, id: generateId('site'), createdAt: new Date().toISOString() }
    setJobSites(prev => [...prev, newSite])
  }

  const updateJobSite = (id: string, updates: Partial<JobSite>) =>
    setJobSites(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: generateId('task'), createdAt: new Date().toISOString() }
    setTasks(prev => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))

  const addTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = { ...entry, id: generateId('time') }
    setTimeEntries(prev => [...prev, newEntry])
  }

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) =>
    setTimeEntries(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)))

  const addCheckIn = (checkin: Omit<CheckIn, 'id'>) => {
    const newCheckIn: CheckIn = { ...checkin, id: generateId('checkin') }
    setCheckIns(prev => [...prev, newCheckIn])
  }

  const addChangeOrder = (order: Omit<ChangeOrder, 'id' | 'createdAt'>) => {
    const newOrder: ChangeOrder = { ...order, id: generateId('co'), createdAt: new Date().toISOString() }
    setChangeOrders(prev => [...prev, newOrder])
  }

  const updateChangeOrder = (id: string, updates: Partial<ChangeOrder>) =>
    setChangeOrders(prev => prev.map(o => (o.id === id ? { ...o, ...updates } : o)))

  const updateWorkerProfile = (profile: WorkerProfile) =>
    setWorkerProfiles(prev => prev.map(p => (p.userId === profile.userId ? profile : p)))

  const addWorker = (user: User, profile: WorkerProfile) => {
    setUsers(prev => [...prev, user])
    setWorkerProfiles(prev => [...prev, profile])
  }

  const markAlertRead = (id: string) =>
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)))

  const getWorkerById = (id: string) => users.find(u => u.id === id)
  const getJobSiteById = (id: string) => jobSites.find(s => s.id === id)
  const getTaskById = (id: string) => tasks.find(t => t.id === id)
  const getActiveTimeEntry = (workerId: string) =>
    timeEntries.find(e => e.workerId === workerId && !e.clockOut)

  return (
    <AppContext.Provider value={{
      users, jobSites, tasks, timeEntries, checkIns, changeOrders, workerProfiles, alerts,
      addJobSite, updateJobSite, addTask, updateTask, addTimeEntry, updateTimeEntry,
      addCheckIn, addChangeOrder, updateChangeOrder, updateWorkerProfile, addWorker,
      markAlertRead, getWorkerById, getJobSiteById, getTaskById, getActiveTimeEntry,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
