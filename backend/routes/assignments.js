import express from 'express'
import { protect, adminAuth } from '../middleware/auth.js'
import {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  submitAssignment,
  generateCertificate,
  getStudentCertificates,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js'

const router = express.Router()

// Educator routes (require auth + educator role)
router.post('/courses/:courseId/assignments', protect, adminAuth, createAssignment)
router.put('/assignments/:assignmentId', protect, adminAuth, updateAssignment)
router.delete('/assignments/:assignmentId', protect, adminAuth, deleteAssignment)

// Student routes (require auth)
router.get('/courses/:courseId/assignments', protect, getCourseAssignments)
router.get('/assignments/:assignmentId', protect, getAssignmentById)
router.post('/assignments/:assignmentId/submit', protect, submitAssignment)
router.post('/assignments/:assignmentId/certificate', protect, generateCertificate)
router.get('/certificates', protect, getStudentCertificates)

export default router
