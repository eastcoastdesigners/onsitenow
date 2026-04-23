export type UserRole = 'boss' | 'worker'
export type Language = 'en' | 'es' | 'pt' | 'ht' | 'pl'
export type BossPlan = 'starter' | 'growth' | 'enterprise'
export type WorkerPlan = 'free' | 'pro'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  plan: BossPlan | WorkerPlan
  language: Language
  phone?: string
  avatarUrl?: string
  companyName?: string
  createdAt: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  verified: boolean
}

export interface License {
  id: string
  type: string
  number: string
  state: string
  expiryDate: string
}

export interface WorkerProfile {
  userId: string
  skills: string[]
  certifications: Certification[]
  licenses: License[]
  bio?: string
  yearsExperience: number
  rating: number
}

export type SiteStatus = 'active' | 'completed' | 'paused'

export interface JobSite {
  id: string
  name: string
  address: string
  city: string
  state: string
  bossId: string
  workerIds: string[]
  status: SiteStatus
  startDate: string
  endDate?: string
  coordinates?: { lat: number; lng: number }
  description?: string
  createdAt: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  jobSiteId: string
  title: string
  description: string
  assignedTo: string
  assignedBy: string
  estimatedMinutes: number
  status: TaskStatus
  priority: TaskPriority
  photosBefore: string[]
  photosDuring: string[]
  photosAfter: string[]
  videoLinks: string[]
  createdAt: string
  startedAt?: string
  completedAt?: string
  dueDate?: string
  notes?: string
}

export interface TimeEntry {
  id: string
  taskId: string
  workerId: string
  jobSiteId: string
  clockIn: string
  clockOut?: string
  totalMinutes?: number
  isOvertime: boolean
  notes?: string
}

export interface CheckIn {
  id: string
  workerId: string
  jobSiteId: string
  timestamp: string
  photoUrl: string
  location: { lat: number; lng: number; address?: string }
  verified: boolean
}

export type ChangeOrderStatus = 'pending' | 'approved' | 'rejected'

export interface ChangeOrder {
  id: string
  jobSiteId: string
  title: string
  description: string
  estimatedCost: number
  status: ChangeOrderStatus
  requestedBy: string
  createdAt: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  photos: string[]
}

export interface Alert {
  id: string
  type: 'overtime' | 'missed_checkin' | 'task_overdue' | 'change_order'
  message: string
  workerId?: string
  taskId?: string
  jobSiteId?: string
  createdAt: string
  read: boolean
}
