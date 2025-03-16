'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Define user type
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  settings?: Record<string, any>
}

// Define auth context type
interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUser: async () => {}
})

// Hook to use auth context
export const useAuth = () => useContext(AuthContext)

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in localStorage
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          setLoading(false)
          return
        }
        
        // Fetch user profile from API
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // Clear invalid token
          localStorage.removeItem('auth_token')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }
      
      const data = await response.json()
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token)
      
      // Set user data
      setUser(data.user)
      
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      setLoading(true)
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
      }
      
      const data = await response.json()
      
      // Save token to localStorage
      localStorage.setItem('auth_token', data.token)
      
      // Set user data
      setUser(data.user)
      
      // Redirect to home page
      router.push('/')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token')
    
    // Clear user data
    setUser(null)
    
    // Redirect to login page
    router.push('/login')
  }

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true)
      
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('Not authenticated')
      }
      
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Update failed')
      }
      
      const updatedUser = await response.json()
      
      // Update user data
      setUser(prev => prev ? { ...prev, ...updatedUser } : updatedUser)
      
      return updatedUser
    } catch (error) {
      console.error('Update failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
