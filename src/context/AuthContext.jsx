import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API_URL } from '../config/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

// Helper for API calls with auth
const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('flipd-token')
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [tags, setTags] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // Load data from backend when logged in
  const loadUserData = useCallback(async () => {
    try {
      const [tagsData, sessionsData] = await Promise.all([
        authFetch('/api/tags'),
        authFetch('/api/sessions'),
      ])

      // Transform backend data to match frontend format
      const formattedTags = tagsData.map(t => ({
        id: t._id,
        name: t.name,
        color: t.color,
      }))

      const formattedSessions = sessionsData.map(s => ({
        id: s._id,
        tag: s.tag ? { id: s.tag._id, name: s.tag.name, color: s.tag.color } : null,
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
    }
  }, [])

  useEffect(() => {
    // Check for stored token and user
    const token = localStorage.getItem('flipd-token')
    const storedUser = localStorage.getItem('flipd-user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)

    // Listen for auth callback messages
    const handleMessage = (event) => {
      if (event.data.type === 'AUTH_SUCCESS') {
        const { token, user } = event.data
        localStorage.setItem('flipd-token', token)
        localStorage.setItem('flipd-user', JSON.stringify(user))
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
    localStorage.removeItem('flipd-token')
    localStorage.removeItem('flipd-user')
    setUser(null)
    setDataLoaded(false)
    setSessions([])
    setTags([])
  }

  const getToken = () => localStorage.getItem('flipd-token')

  // API methods for data sync
  const api = {
    // Tags
    createTag: async (name, color) => {
      const tag = await authFetch('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name, color }),
      })
      const formatted = { id: tag._id, name: tag.name, color: tag.color }
      setTags(prev => [...prev, formatted])
      return formatted
    },

    deleteTag: async (tagId) => {
      await authFetch(`/api/tags/${tagId}`, { method: 'DELETE' })
      setTags(prev => prev.filter(t => t.id !== tagId))
    },

    // Sessions
    createSession: async (sessionData) => {
      const session = await authFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          tag: sessionData.tag.id,
          timerMode: sessionData.timerMode,
          countdownMinutes: sessionData.countdownMinutes,
          startTime: new Date(sessionData.startTime),
          endTime: sessionData.endTime ? new Date(sessionData.endTime) : null,
          focusTime: sessionData.focusTime,
          breakTime: sessionData.breakTime,
        }),
      })
      const formatted = {
        id: session._id,
        tag: session.tag ? { id: session.tag._id, name: session.tag.name, color: session.tag.color } : null,
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

    deleteSession: async (sessionId) => {
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
