import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import axios from 'axios'

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth()
  const navigate = useNavigate()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: ''
  })
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Image state
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  
  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      })
      setImagePreview(user.imageUrl || '')
    }
  }, [user])
  
  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const result = await updateProfile({
        ...profileData,
        image: selectedImage
      })
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setSelectedImage(null)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    
    setLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
          </div>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>
        
        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Change Password
          </button>
        </div>
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={imagePreview || assets.profile_img}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <label className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition-colors">
                    <img src={assets.file_upload_icon} alt="Upload" className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">Upload a new profile image</p>
                </div>
              </div>
              
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Share a brief description about yourself</p>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}
        
        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Enter your new password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>
              
              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                  placeholder="Confirm your new password"
                  required
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
        
        {/* User Info Card */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="text-lg font-medium text-gray-900 capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Verification</p>
              <p className="text-lg font-medium text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isEmailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isEmailVerified ? 'Verified' : 'Pending'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-sm font-mono text-gray-500">{user._id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
