import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, Language, BossPlan, WorkerPlan } from '../types'
import { storage, generateId } from '../utils/storage'
import { MOCK_USERS } from '../utils/mockData'

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'boss' | 'worker'
  plan: BossPlan | WorkerPlan
  companyName?: string
  language: Language
}

interface AuthContextType {
  currentUser: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
  updateLanguage: (lang: Language) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return storage.get<User>('currentUser')
  })

  useEffect(() => {
    const existing = storage.get<User[]>('users')
    if (!existing) {
      storage.set('users', MOCK_USERS)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const users = storage.get<User[]>('users') ?? MOCK_USERS
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    setCurrentUser(user)
    storage.set('currentUser', user)
  }

  const logout = () => {
    setCurrentUser(null)
    storage.remove('currentUser')
  }

  const register = async (data: RegisterData) => {
    const users = storage.get<User[]>('users') ?? MOCK_USERS
    if (users.find(u => u.email === data.email)) {
      throw new Error('An account with this email already exists')
    }
    const newUser: User = {
      id: generateId(data.role),
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      plan: data.plan,
      language: data.language,
      companyName: data.companyName,
      createdAt: new Date().toISOString(),
    }
    storage.set('users', [...users, newUser])
    setCurrentUser(newUser)
    storage.set('currentUser', newUser)
  }

  const updateLanguage = (lang: Language) => {
    if (!currentUser) return
    const updated = { ...currentUser, language: lang }
    const users = storage.get<User[]>('users') ?? []
    storage.set('users', users.map(u => (u.id === updated.id ? updated : u)))
    setCurrentUser(updated)
    storage.set('currentUser', updated)
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, updateLanguage }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
