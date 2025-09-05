import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

// Configure axios defaults
axios.defaults.baseURL = 'https://lms-6nmc.onrender.com/api'
axios.defaults.withCredentials = true

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me')
      if (response.data.success) {
        setUser(response.data.user)
      }
    } catch (error) {
      if (error?.response?.status !== 401) {
        // Auth check error
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      if (response.data.success) {
        setUser(response.data.user)
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials)
      if (response.data.success) {
        setUser(response.data.user)
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post('/auth/logout')
      setUser(null)
      return { success: true, message: 'Logged out successfully' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Logout failed' 
      }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const formData = new FormData()
      
      // Add text fields
      if (profileData.name) formData.append('name', profileData.name)
      if (profileData.email) formData.append('email', profileData.email)
      if (profileData.bio) formData.append('bio', profileData.bio)
      
      // Add image if provided
      if (profileData.image) {
        formData.append('image', profileData.image)
      }

      const response = await axios.put('/users/profile', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        setUser(response.data.user)
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      }
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await axios.put('/users/change-password', passwordData, {
        withCredentials: true
      })

      if (response.data.success) {
        return { success: true, message: response.data.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change password' 
      }
    }
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isEducator: user?.role === 'educator',
    isStudent: user?.role === 'student',
    isEmailVerified: user?.isEmailVerified || false
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
