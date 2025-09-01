import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import OTP from '../models/OTP.js'
import { sendPasswordResetOTPEmail, sendRegistrationOTPEmail } from '../services/emailService.js'

// Generate JWT Token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || "default-secret-key"
  return jwt.sign({ userId }, secret, {
    expiresIn: '7d'
  })
}

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body
    
    // Set default role to 'student' if not provided
    const userRole = role || 'student'

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required for registration'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      })
    }

    // Verify OTP before registration
    const isValidOTP = await OTP.verifyAndConsumeOTP(email, otp)
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user with verified email
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      isEducator: userRole === 'educator',
      isEmailVerified: true
    })

    // Generate token
    const token = generateToken(user._id)

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEducator: user.isEducator,
        isEmailVerified: user.isEmailVerified,
        imageUrl: user.imageUrl
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    })
  }
}

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification code.'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    const token = generateToken(user._id)

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEducator: user.isEducator,
        isEmailVerified: user.isEmailVerified,
        imageUrl: user.imageUrl
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Logout User
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' })
    }

    res.status(200).json({ 
      success: true, 
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isEducator: req.user.isEducator,
        isEmailVerified: req.user.isEmailVerified,
        imageUrl: req.user.imageUrl
      }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

// Send OTP for password reset
export const sendPasswordResetOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      })
    }

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      })
    }

    // Generate and save OTP
    const otpDoc = await OTP.createOTP(email)
    
    // Send OTP via email
    const emailResult = await sendPasswordResetOTPEmail(email, user.name, otpDoc.otp)
    
    if (!emailResult.success) {
      // If email fails, delete the OTP and return error
      await OTP.findByIdAndDelete(otpDoc._id)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Verify OTP for password reset
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    // Verify OTP request body
    const { email, otp } = req.body

    if (!email || !otp) {
      // Missing fields in verify OTP
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      })
    }

    // Verify OTP
    const isValidOTP = await OTP.verifyOTP(email, otp)
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      })
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Reset password with OTP
export const resetPassword = async (req, res) => {
  try {
    // Reset password request body
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      // Missing fields
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Verify and consume OTP (marks it as used)
    const isValidOTP = await OTP.verifyAndConsumeOTP(email, otp)
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      })
    }

    // Find user and update password
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update user password
    user.password = hashedPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Send OTP for user registration
export const sendRegistrationOTP = async (req, res) => {
  try {
    const { email, name } = req.body

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Generate and save OTP
    const otpDoc = await OTP.createOTP(email)
    
    // Send OTP via email
    const emailResult = await sendRegistrationOTPEmail(email, name, otpDoc.otp)
    
    if (!emailResult.success) {
      // If email fails, delete the OTP and return error
      await OTP.findByIdAndDelete(otpDoc._id)
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      })
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    })

  } catch (error) {
    console.error('Send registration OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

// Verify OTP for user registration
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      })
    }

    // Verify OTP
    const isValidOTP = await OTP.verifyOTP(email, otp)
    
    if (!isValidOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      })
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    })

  } catch (error) {
    console.error('Verify registration OTP error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}