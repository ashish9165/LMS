import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import axios from 'axios'

const LoginForm = ({ onSwitchToRegister }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { uiTheme, isMobile, isTablet, isDesktop } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [showForgetPassword, setShowForgetPassword] = useState(false)
  const [forgetPasswordStep, setForgetPasswordStep] = useState('email') // 'email', 'otp', 'newPassword'
  const [forgetPasswordData, setForgetPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [forgetPasswordLoading, setForgetPasswordLoading] = useState(false)
  const [forgetPasswordMessage, setForgetPasswordMessage] = useState({ type: '', text: '' })

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true)
    try {
      const result = await login(values)
      if (result.success) {
        navigate('/')
      } else {
        setFieldError('password', result.message)
      }
    } catch (error) {
      setFieldError('password', 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
      setSubmitting(false)
    }
  }

  // Forget Password Functions
  const handleSendOTP = async () => {
    if (!forgetPasswordData.email) {
      setForgetPasswordMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    setForgetPasswordLoading(true)
    try {
      const response = await axios.post('/auth/forget-password/send-otp', {
        email: forgetPasswordData.email
      })
      
      if (response.data.success) {
        setForgetPasswordStep('otp')
        setForgetPasswordMessage({ type: 'success', text: 'OTP sent to your email successfully!' })
      } else {
        setForgetPasswordMessage({ type: 'error', text: response.data.message || 'Failed to send OTP' })
      }
    } catch (error) {
      setForgetPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
      })
    } finally {
      setForgetPasswordLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!forgetPasswordData.otp) {
      setForgetPasswordMessage({ type: 'error', text: 'Please enter the OTP' })
      return
    }

    // Verifying OTP with data

    setForgetPasswordLoading(true)
    try {
      const response = await axios.post('/auth/forget-password/verify-otp', {
        email: forgetPasswordData.email,
        otp: forgetPasswordData.otp
      })
      
      if (response.data.success) {
        // OTP verified successfully, moving to password step
        setForgetPasswordStep('newPassword')
        setForgetPasswordMessage({ type: 'success', text: 'OTP verified successfully! Now set your new password.' })
      } else {
        // OTP verification failed
        setForgetPasswordMessage({ type: 'error', text: response.data.message || 'Invalid OTP' })
      }
    } catch (error) {
      setForgetPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to verify OTP. Please try again.' 
      })
    } finally {
      setForgetPasswordLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!forgetPasswordData.newPassword || !forgetPasswordData.confirmPassword) {
      setForgetPasswordMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    if (forgetPasswordData.newPassword !== forgetPasswordData.confirmPassword) {
      setForgetPasswordMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (forgetPasswordData.newPassword.length < 6) {
      setForgetPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setForgetPasswordLoading(true)
    try {
      // Sending reset password request
      
      const response = await axios.post('/auth/forget-password/reset-password', {
        email: forgetPasswordData.email,
        otp: forgetPasswordData.otp,
        newPassword: forgetPasswordData.newPassword
      })
      
      if (response.data.success) {
        setForgetPasswordMessage({ type: 'success', text: 'Password reset successfully! You can now login with your new password.' })
        setTimeout(() => {
          setShowForgetPassword(false)
          setForgetPasswordStep('email')
          setForgetPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' })
          setForgetPasswordMessage({ type: '', text: '' })
        }, 3000)
      } else {
        setForgetPasswordMessage({ type: 'error', text: response.data.message || 'Failed to reset password' })
      }
    } catch (error) {
      setForgetPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to reset password. Please try again.' 
      })
    } finally {
      setForgetPasswordLoading(false)
    }
  }

  const resetForgetPassword = () => {
    setShowForgetPassword(false)
    setForgetPasswordStep('email')
    setForgetPasswordData({ email: '', otp: '', newPassword: '', confirmPassword: '' })
    setForgetPasswordMessage({ type: '', text: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className={`w-full ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-md' : 'max-w-lg'} mx-auto`}>
        {/* Main Login Form */}
        {!showForgetPassword ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-6 lg:p-8">
            <div className="text-center mb-8">
              <h2 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
                Welcome Back
              </h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>
            
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                        errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 ${
                        errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Forget Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgetPassword(true)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition-colors duration-200"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onSwitchToRegister}
                  className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors duration-200"
                >
                  Register here
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* Forget Password Form */
          <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-6 lg:p-8">
            <div className="text-center mb-8">
              <h2 className={`font-bold text-gray-800 mb-2 ${isMobile ? 'text-2xl' : 'text-3xl lg:text-4xl'}`}>
                Reset Password
              </h2>
              <p className="text-gray-600">
                {forgetPasswordStep === 'email' && 'Enter your email to receive OTP'}
                {forgetPasswordStep === 'otp' && 'Enter the OTP sent to your email'}
                {forgetPasswordStep === 'newPassword' && 'Set your new password'}
              </p>
            </div>

            {/* Message Display */}
            {forgetPasswordMessage.text && (
              <div className={`mb-6 p-4 rounded-lg border ${
                forgetPasswordMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border-green-200' 
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    forgetPasswordMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="font-medium">{forgetPasswordMessage.text}</span>
                </div>
              </div>
            )}

            {/* Step 1: Email Input */}
            {forgetPasswordStep === 'email' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgetPasswordData.email}
                    onChange={(e) => setForgetPasswordData({ ...forgetPasswordData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>
                <button
                  onClick={handleSendOTP}
                  disabled={forgetPasswordLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgetPasswordLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {forgetPasswordStep === 'otp' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={forgetPasswordData.otp}
                    onChange={(e) => setForgetPasswordData({ ...forgetPasswordData, otp: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 text-center text-lg font-mono"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Check your email for the OTP code
                  </p>
                </div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={forgetPasswordLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgetPasswordLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            )}

            {/* Step 3: New Password Input */}
            {forgetPasswordStep === 'newPassword' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={forgetPasswordData.newPassword}
                    onChange={(e) => setForgetPasswordData({ ...forgetPasswordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={forgetPasswordData.confirmPassword}
                    onChange={(e) => setForgetPasswordData({ ...forgetPasswordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                    placeholder="Confirm new password"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={forgetPasswordLoading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgetPasswordLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            )}

            {/* Back to Login Button */}
            <div className="mt-8 text-center">
              <button
                onClick={resetForgetPassword}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginForm
