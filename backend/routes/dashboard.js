import express from 'express'
import {
  getDashboardData,
  getCourseAnalytics,
  getEnrolledStudents,
  getEnrolledStudentsData,
  addNewEducator,
  getAllEducators,
  deleteEducator
} from '../controllers/dashboardController.js'
import { adminAuth, protect } from '../middleware/auth.js'

const router = express.Router()

// All dashboard routes require authentication
router.use(protect)

// Get main dashboard data
router.get('/', getDashboardData)

// Get course-specific analytics
router.get('/course/:courseId', getCourseAnalytics)

// Get enrolled students for a course
router.get('/course/:courseId/students',adminAuth, getEnrolledStudents)

// Get enrolled students data for dashboard
router.get('/enrolled-students', getEnrolledStudentsData)

// Educator management routes (only for existing educators)
router.post('/educators', adminAuth, addNewEducator)
router.get('/educators', adminAuth, getAllEducators)
router.delete('/educators/:educatorId', adminAuth, deleteEducator)

export default router
