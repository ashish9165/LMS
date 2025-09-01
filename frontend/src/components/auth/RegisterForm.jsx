import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const RegisterForm = ({ onSwitchToLogin }) => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState('info') // 'info', 'otp', 'complete'
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [otp, setOtp] = useState('')
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' })
  const [isSendingOTP, setIsSendingOTP] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  })

  const handleSendOTP = async (values) => {
    setIsSendingOTP(true)
    setOtpMessage({ type: '', text: '' })
    
    try {
      const response = await axios.post('/auth/register/send-otp', {
        email: values.email,
        name: values.name
      })
      
      if (response.data.success) {
        setRegistrationData(values)
        setCurrentStep('otp')
        setOtpMessage({ type: 'success', text: 'OTP sent successfully! Check your email.' })
      } else {
        setOtpMessage({ type: 'error', text: response.data.message || 'Failed to send OTP' })
      }
    } catch (error) {
      setOtpMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
      })
    } finally {
      setIsSendingOTP(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp) {
      setOtpMessage({ type: 'error', text: 'Please enter the OTP' })
      return
    }

    setIsLoading(true)
    setOtpMessage({ type: '', text: '' })
    
    try {
      const response = await axios.post('/auth/register/verify-otp', {
        email: registrationData.email,
        otp: otp
      })
      
      if (response.data.success) {
        setCurrentStep('complete')
        setOtpMessage({ type: 'success', text: 'OTP verified successfully!' })
      } else {
        setOtpMessage({ type: 'error', text: response.data.message || 'Invalid OTP' })
      }
    } catch (error) {
      setOtpMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to verify OTP. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalRegistration = async () => {
    setIsLoading(true)
    
    try {
      const result = await register({
        ...registrationData,
        role: 'student', // Default role for all new registrations
        otp: otp
      })
      
      if (result.success) {
        navigate('/')
      } else {
        setOtpMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setOtpMessage({ type: 'error', text: 'Registration failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = () => {
    handleSendOTP(registrationData)
  }

  const goBackToInfo = () => {
    setCurrentStep('info')
    setOtp('')
    setOtpMessage({ type: '', text: '' })
  }

  // Step 1: Basic Information
  if (currentStep === 'info') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>
        
        <Formik
          initialValues={{ 
            name: '', 
            email: '', 
            password: '', 
            confirmPassword: '' 
          }}
          validationSchema={validationSchema}
          onSubmit={handleSendOTP}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Field
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
              </div>



              <button
                type="submit"
                disabled={isSubmitting || isSendingOTP}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingOTP ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Step 2: OTP Verification
  if (currentStep === 'otp') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Verify Your Email</h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            We've sent a verification code to:
          </p>
          <p className="font-semibold text-gray-800">{registrationData.email}</p>
        </div>

        {otpMessage.text && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            otpMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {otpMessage.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isLoading || !otp}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isSendingOTP}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSendingOTP ? 'Sending...' : 'Resend'}
            </button>
          </div>

          <button
            type="button"
            onClick={goBackToInfo}
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to registration form
          </button>
        </div>
      </div>
    )
  }

  // Step 3: Complete Registration
  if (currentStep === 'complete') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-6">
            Your email has been verified successfully. You can now complete your registration.
          </p>

          <button
            onClick={handleFinalRegistration}
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>

          {otpMessage.text && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              otpMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {otpMessage.text}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default RegisterForm
