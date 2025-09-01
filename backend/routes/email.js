import express from 'express'
import { testEmail, getEmailStatus } from '../controllers/emailController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Test email functionality (protected route)
router.post('/test', protect, testEmail)

// Get email configuration status
router.get('/status', getEmailStatus)

export default router
