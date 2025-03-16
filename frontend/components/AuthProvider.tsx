'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Function to fetch user profile
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const userData = await response.json()
      setUser(userData)
      return userData
    } catch (error) {
      console.error('Error fetching user profile:', error)
      localStorage.removeItem('token')
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      
      if (token) {
        await fetchUserProfile(token)
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Handle protected routes
  useEffect(() => {
    const protectedRoutes = ['/meetings', '/record', '/people', '/projects']
    const authRoutes = ['/login', '/register']
    
    // Skip during initial loading
    if (loading) return
    
    // If on a protected route and not authenticated, redirect to login
    if (protectedRoutes.some(route => pathname?.startsWith(route)) && !user) {
      router.push('/login')
    }
    
    // If authenticated and on an auth route, redirect to meetings
    if (user && authRoutes.includes(pathname || '')) {
      router.push('/meetings')
    }
  }, [pathname, user, loading, router])

  // Login function
  const login = (token: string) => {
    localStorage.setItem('token', token)
    fetchUserProfile(token)
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
