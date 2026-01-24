import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { API_URL } from '../config/api'
import type { User, Tag, Session, AuthContextType, ApiMethods } from '../types'

// Backend response types
interface BackendTag {
  _id: string
  name: string
  color: string
}

interface BackendSession {
  _id: string
  tag: BackendTag | null
  timerMode: 'stopwatch' | 'countdown'
  countdownMinutes: number | null
  startTime: string
  endTime: string | null
  focusTime: number
  breakTime: number
}

interface AuthMessage {
  type: string
  token?: string
  user?: User
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper for API calls with auth
interface FetchOptions extends RequestInit {
  headers?: Record<string, string>
}

const authFetch = async <T,>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const token = localStorage.getItem('fayd-token')
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load data from backend when logged in
  const loadUserData = useCallback(async () => {
    try {
      const [tagsData, sessionsData] = await Promise.all([
        authFetch<BackendTag[]>('/api/tags'),
        authFetch<BackendSession[]>('/api/sessions'),
      ])

      // Transform backend data to match frontend format
      const formattedTags: Tag[] = tagsData.map(t => ({
        id: t._id,
        name: t.name,
        color: t.color,
      }))

      const formattedSessions: Session[] = sessionsData.map(s => ({
        id: s._id,
        tag: s.tag ? { id: s.tag._id, name: s.tag.name, color: s.tag.color } : { id: '', name: '', color: '' },
        timerMode: s.timerMode,
        countdownMinutes: s.countdownMinutes,
        startTime: new Date(s.startTime).getTime(),
        endTime: s.endTime ? new Date(s.endTime).getTime() : null,
        focusTime: s.focusTime,
        breakTime: s.breakTime,
      }))

      setTags(formattedTags)
      setSessions(formattedSessions)
      setDataLoaded(true)
    } catch (error) {
      console.error('Failed to load user data:', error)
      // Still mark as loaded so app doesn't hang - user will see local/empty data
      setDataLoaded(true)
    }
  }, [])

  useEffect(() => {
    // Check for stored token and user
    const token = localStorage.getItem('fayd-token')
    const storedUser = localStorage.getItem('fayd-user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

    // Listen for auth callback messages
    const handleMessage = (event: MessageEvent<AuthMessage>) => {
      if (event.data.type === 'AUTH_SUCCESS' && event.data.token && event.data.user) {
        const { token, user } = event.data
        localStorage.setItem('fayd-token', token)
        localStorage.setItem('fayd-user', JSON.stringify(user))
        setUser(user)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Load data when user logs in
  useEffect(() => {
    if (user && !dataLoaded) {
      loadUserData()
    }
    if (!user) {
      setDataLoaded(false)
      setSessions([])
      setTags([])
    }
  }, [user, dataLoaded, loadUserData])

  const login = () => {
    // Open Google OAuth in a popup
    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    window.open(
      `${API_URL}/auth/google`,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    )
  }

  const logout = () => {
    localStorage.removeItem('fayd-token')
    localStorage.removeItem('fayd-user')
    setUser(null)
    setDataLoaded(false)
    setSessions([])
    setTags([])
  }

  const getToken = () => localStorage.getItem('fayd-token')

  // API methods for data sync
  const api: ApiMethods = {
    // Tags
    createTag: async (name: string, color: string) => {
      const tag = await authFetch<BackendTag>('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      })
      const formatted: Tag = { id: tag._id, name: tag.name, color: tag.color }
      setTags(prev => [...prev, formatted])
      return formatted
    },

    updateTag: async (tagId: string, name: string, color: string) => {
      const tag = await authFetch<BackendTag>(`/api/tags/${tagId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, color }),
      })
      const formatted: Tag = { id: tag._id, name: tag.name, color: tag.color }
      setTags(prev => prev.map(t => t.id === tagId ? formatted : t))
      // Also update sessions that use this tag
      setSessions(prev => prev.map(s =>
        s.tag.id === tagId ? { ...s, tag: formatted } : s
      ))
      return formatted
    },

    deleteTag: async (tagId: string) => {
      await authFetch(`/api/tags/${tagId}`, { method: 'DELETE' })
      setTags(prev => prev.filter(t => t.id !== tagId))
    },

    // Sessions
    createSession: async (sessionData: Partial<Session>) => {
      const session = await authFetch<BackendSession>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          tag: sessionData.tag?.id,
          timerMode: sessionData.timerMode,
          countdownMinutes: sessionData.countdownMinutes,
          startTime: sessionData.startTime ? new Date(sessionData.startTime) : null,
          endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
          focusTime: sessionData.focusTime,
          breakTime: sessionData.breakTime,
        }),
      })
      const formatted: Session = {
        id: session._id,
        tag: session.tag ? { id: session.tag._id, name: session.tag.name, color: session.tag.color } : { id: '', name: '', color: '' },
        timerMode: session.timerMode,
        countdownMinutes: session.countdownMinutes,
        startTime: new Date(session.startTime).getTime(),
        endTime: session.endTime ? new Date(session.endTime).getTime() : null,
        focusTime: session.focusTime,
        breakTime: session.breakTime,
      }
      setSessions(prev => [formatted, ...prev])
      return formatted
    },

    deleteSession: async (sessionId: string) => {
      await authFetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    },
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      getToken,
      sessions,
      tags,
      dataLoaded,
      api,
      refreshData: loadUserData,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
