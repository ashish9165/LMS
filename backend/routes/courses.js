import express from 'express'

import {
  createCourse,
  getAllCourses,
  getCourseById,
  getEducatorCourses,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  updateProgress,
  rateCourse,
  getCourseAnalytics,
  updateEnrollmentStatus
} from '../controllers/courseController.js'
import { protect, adminAuth, optionalAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', getAllCourses)



// Protected routes
router.use(protect)

// Course management (educators only)
router.post('/', upload.single('thumbnail'),adminAuth, createCourse)
router.get('/educator/my-courses',adminAuth, getEducatorCourses)
router.put('/:id', upload.single('thumbnail'),adminAuth, updateCourse)
router.delete('/:id',adminAuth, deleteCourse)
router.get('/:courseId/analytics',adminAuth, getCourseAnalytics)

// Enrollment management (educators only)
router.put('/enrollment/:enrollmentId/status', adminAuth, updateEnrollmentStatus)

// Enrollment routes
router.post('/:courseId/enroll', enrollInCourse)
router.get('/enrolled/my-courses', getEnrolledCourses)
router.put('/:courseId/progress/:lectureId', updateProgress)
router.post('/:courseId/rate', rateCourse)

// Keep the dynamic route at the very end to avoid conflicts
router.get('/:id', optionalAuth, getCourseById)

export default router
