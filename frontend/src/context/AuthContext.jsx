import React, { createContext, useState, useEffect, useCallback } from 'react'
import api from '../api/axios.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const response = await api.get('/accounts/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Auth error:', error)
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', response.data.access)
    localStorage.setItem('refresh_token', response.data.refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`
    const userRes = await api.get('/accounts/me/')
    setUser(userRes.data)
    return userRes.data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  const hasRole = (role) => {
    if (!user) return false
    if (role === 'admin') return user.role === 'admin'
    if (role === 'vendor') return user.role === 'vendor' || user.role === 'admin'
    if (role === 'client') return user.role === 'client'
    return false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
