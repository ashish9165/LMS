import express from 'express'
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
  getUserStats
} from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// All user routes require authentication
router.use(protect)

// Profile routes
router.get('/profile', getUserProfile)
router.put('/profile', upload.single('image'), updateUserProfile)
router.put('/change-password', changePassword)
router.delete('/account', deleteUserAccount)

// Statistics
router.get('/stats', getUserStats)

export default router
