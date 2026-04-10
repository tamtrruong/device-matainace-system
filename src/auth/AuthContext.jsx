import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, usersApi } from '../api/modules'
import { getErrorMessage } from '../api/http'

const AuthContext = createContext(null)

const parseStoredUser = () => {
  try {
    const value = localStorage.getItem('auth_user')
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(parseStoredUser())
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('access_token')))

  const syncProfile = async () => {
    try {
      const profile = await usersApi.me()
      setUser(profile)
      localStorage.setItem('auth_user', JSON.stringify(profile))
      return profile
    } catch (error) {
      logout()
      throw error
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      setLoading(false)
      return
    }
    syncProfile().finally(() => setLoading(false))
  }, [])

  const login = async (payload) => {
    const authData = await authApi.login(payload)
    localStorage.setItem('access_token', authData.accessToken)
    localStorage.setItem('refresh_token', authData.refreshToken)
    const profile = await syncProfile().catch(() => ({
      id: authData.userId,
      username: authData.username,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
      avatarUrl: authData.avatarUrl,
    }))
    setUser(profile)
    localStorage.setItem('auth_user', JSON.stringify(profile))
    return profile
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user && localStorage.getItem('access_token')),
    login,
    logout,
    syncProfile,
    getRoleLabel: (role) => ({
      ROLE_ADMIN: 'Admin',
      ROLE_MANAGER: 'Manager',
      ROLE_TECHNICIAN: 'Kỹ thuật viên',
      ROLE_USER: 'Người dùng',
    }[role] || role),
    getErrorMessage,
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
