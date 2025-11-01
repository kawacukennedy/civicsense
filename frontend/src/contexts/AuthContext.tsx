import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

interface User {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token')
  })

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['user', token],
    queryFn: async () => {
      if (!token) return null
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    enabled: !!token,
    retry: false,
  })

  const login = (newToken: string) => {
    setToken(newToken)
    localStorage.setItem('auth_token', newToken)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
    refetch()
  }

  // Handle token expiration
  useEffect(() => {
    if (user === null && token) {
      // Token might be invalid, clear it
      logout()
    }
  }, [user, token])

  const value: AuthContextType = {
    user: user || null,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}