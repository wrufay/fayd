import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_URL } from '../config/api'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
  }

  const getToken = () => localStorage.getItem('flipd-token')

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}
