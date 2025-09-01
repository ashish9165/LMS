import express from 'express'
import { register, login, logout, getCurrentUser, sendPasswordResetOTP, verifyPasswordResetOTP, resetPassword, sendRegistrationOTP, verifyRegistrationOTP } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register/send-otp', sendRegistrationOTP)
router.post('/register/verify-otp', verifyRegistrationOTP)
router.post('/register', register)
router.post('/login', login) 
router.post('/logout', logout)

// Password reset routes
router.post('/forget-password/send-otp', sendPasswordResetOTP)
router.post('/forget-password/verify-otp', verifyPasswordResetOTP)
router.post('/forget-password/reset-password', resetPassword)

// Protected routes
router.get('/me', protect, getCurrentUser)

export default router
