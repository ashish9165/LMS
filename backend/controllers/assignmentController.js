import Assignment from '../models/Assignment.js'
import AssignmentSubmission from '../models/AssignmentSubmission.js'
import Certificate from '../models/Certificate.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'
import { sendAssessmentCompletionEmail, sendCourseCompletionEmail } from '../services/emailService.js'

// Create assignment for a course (Educator only)
export const createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params
    const { title, description, questions, passingScore, timeLimit } = req.body

    // Check if educator owns the course
    const course = await Course.findOne({
      _id: courseId,
      educator: req.userId
    })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one question is required'
      })
    }

    // Validate each question
    for (let question of questions) {
      if (!question.question || !question.options || question.options.length < 2 || !question.correctAnswer) {
        return res.status(400).json({
          success: false,
          message: 'Each question must have a question text, at least 2 options, and a correct answer'
        })
      }
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      questions,
      passingScore: Number(passingScore) || 70,
      timeLimit: Number(timeLimit) || 30
    })

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    })
  } catch (error) {
    console.error('Create assignment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create assignment'
    })
  }
}

// Get assignments for a course
export const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params
    const { studentView } = req.query

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // If student view, check enrollment and video completion
    if (studentView === 'true') {
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        course: courseId
      })

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled to view assignments'
        })
      }

      // Check if all videos are completed
      const totalLectures = course.courseContent.reduce((total, chapter) => {
        return total + chapter.chapterContent.length
      }, 0)

      const completedLectures = enrollment.progress.completedLectures.length

      if (completedLectures < totalLectures) {
        return res.status(403).json({
          success: false,
          message: 'You must complete all course videos before accessing assignments'
        })
      }
    }

    const assignments = await Assignment.find({ course: courseId, isActive: true })
      .select(studentView === 'true' ? 'title description timeLimit' : '-questions.correctAnswer -questions.explanation')

    res.status(200).json({
      success: true,
      assignments
    })
  } catch (error) {
    console.error('Get course assignments error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    })
  }
}

// Get assignment by ID (with questions for students)
export const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { studentView } = req.query

    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'courseTitle')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // If student view, check enrollment and video completion
    if (studentView === 'true') {
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        course: assignment.course._id
      })

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled to view this assignment'
        })
      }

      // Check if all videos are completed
      const course = await Course.findById(assignment.course._id)
      const totalLectures = course.courseContent.reduce((total, chapter) => {
        return total + chapter.chapterContent.length
      }, 0)

      const completedLectures = enrollment.progress.completedLectures.length

      if (completedLectures < totalLectures) {
        return res.status(403).json({
          success: false,
          message: 'You must complete all course videos before accessing this assignment'
        })
      }

      // Remove correct answers and explanations for students
      const studentAssignment = {
        ...assignment.toObject(),
        questions: assignment.questions.map(q => ({
          question: q.question,
          options: q.options,
          points: q.points
        }))
      }

      return res.status(200).json({
        success: true,
        assignment: studentAssignment
      })
    }

    res.status(200).json({
      success: true,
      assignment
    })
  } catch (error) {
    console.error('Get assignment by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment'
    })
  }
}

// Submit assignment (Student only)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { answers, timeTaken } = req.body

    // Get assignment with correct answers
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'courseTitle')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: assignment.course._id
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to submit this assignment'
      })
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      student: req.userId,
      assignment: assignmentId
    })

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment'
      })
    }

    // Grade the assignment
    let score = 0
    const totalPoints = assignment.questions.reduce((sum, q) => sum + q.points, 0)
    const gradedAnswers = []

    for (let i = 0; i < assignment.questions.length; i++) {
      const question = assignment.questions[i]
      const studentAnswer = answers[i]?.studentAnswer || ''
      const isCorrect = studentAnswer === question.correctAnswer
      
      if (isCorrect) {
        score += question.points
      }

      gradedAnswers.push({
        question: question.question,
        studentAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0
      })
    }

    const percentage = Math.round((score / totalPoints) * 100)
    const passed = percentage >= assignment.passingScore

    // Get student details for email
    const student = await User.findById(req.userId)
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Create submission
    const submission = await AssignmentSubmission.create({
      student: req.userId,
      assignment: assignmentId,
      course: assignment.course._id,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      timeTaken: Number(timeTaken) || 0
    })

    // Send assessment completion email
    try {
      await sendAssessmentCompletionEmail(
        student.email,
        student.name,
        assignment.course.courseTitle,
        assignment.title,
        score,
        percentage,
        passed
      )
    } catch (emailError) {
      console.error('Failed to send assessment completion email:', emailError)
      // Don't fail the submission if email fails
    }

    // Update enrollment progress
    if (passed) {
      enrollment.progress.assignmentCompleted = true
      await enrollment.save()

      // Update course enrollment
      await Course.findByIdAndUpdate(assignment.course._id, {
        $set: {
          'enrolledStudents.$[elem].progress.assignmentCompleted': true
        }
      }, {
        arrayFilters: [{ 'elem.student': req.userId }]
      })

      // Auto-generate certificate if not already created
      const existingCertificate = await Certificate.findOne({
        student: req.userId,
        assignment: assignmentId
      })

      if (!existingCertificate) {
        const certificate = await Certificate.create({
          student: req.userId,
          course: assignment.course._id,
          assignment: assignmentId,
          assignmentSubmission: submission._id,
          score,
          percentage
        })

        // Mark certificateEarned on enrollment and course enrollment
        enrollment.progress.certificateEarned = true
        enrollment.status = 'completed'
        await enrollment.save()

        await Course.findByIdAndUpdate(assignment.course._id, {
          $set: {
            'enrolledStudents.$[elem].progress.certificateEarned': true
          }
        }, {
          arrayFilters: [{ 'elem.student': req.userId }]
        })

        // Send course completion email when certificate is earned
        try {
          await sendCourseCompletionEmail(
            student.email,
            student.name,
            assignment.course.courseTitle,
            assignment.course.educator?.name || 'Instructor'
          )
        } catch (emailError) {
          console.error('Failed to send course completion email:', emailError)
          // Don't fail the submission if email fails
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      submission: {
        score,
        totalPoints,
        percentage,
        passed,
        answers: gradedAnswers
      }
    })
  } catch (error) {
    console.error('Submit assignment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to submit assignment'
    })
  }
}

// Generate certificate for passed assignment
export const generateCertificate = async (req, res) => {
  try {
    const { assignmentId } = req.params

    // Check if student passed the assignment
    const submission = await AssignmentSubmission.findOne({
      student: req.userId,
      assignment: assignmentId
    }).populate('assignment course')

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Assignment submission not found'
      })
    }

    if (!submission.passed) {
      return res.status(400).json({
        success: false,
        message: 'You must pass the assignment to generate a certificate'
      })
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      student: req.userId,
      assignment: assignmentId
    })

    if (existingCertificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already exists for this assignment'
      })
    }

    // Create certificate
    const certificate = await Certificate.create({
      student: req.userId,
      course: submission.course._id,
      assignment: assignmentId,
      assignmentSubmission: submission._id,
      score: submission.score,
      percentage: submission.percentage
    })

    // Update enrollment and course progress
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: submission.course._id
    })

    if (enrollment) {
      enrollment.progress.certificateEarned = true
      enrollment.status = 'completed'
      await enrollment.save()
    }

    // Update course enrollment
    await Course.findByIdAndUpdate(submission.course._id, {
      $set: {
        'enrolledStudents.$[elem].progress.certificateEarned': true
      }
    }, {
      arrayFilters: [{ 'elem.student': req.userId }]
    })

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    })
  } catch (error) {
    console.error('Generate certificate error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to generate certificate'
    })
  }
}

// Get student's certificates
export const getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.userId })
      .populate('course', 'courseTitle courseThumbnail')
      .populate('student', 'name')
      .populate('assignment', 'title')
      .sort({ issuedAt: -1 })

    res.status(200).json({
      success: true,
      certificates
    })
  } catch (error) {
    console.error('Get student certificates error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates'
    })
  }
}

// Update assignment (Educator only)
export const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const updateData = { ...req.body }

    // Check if educator owns the assignment
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'educator')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    if (assignment.course.educator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this assignment'
      })
    }

    // Validate questions if provided
    if (updateData.questions) {
      for (let question of updateData.questions) {
        if (!question.question || !question.options || question.options.length < 2 || !question.correctAnswer) {
          return res.status(400).json({
            success: false,
            message: 'Each question must have a question text, at least 2 options, and a correct answer'
          })
        }
      }
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      updateData,
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    })
  } catch (error) {
    console.error('Update assignment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update assignment'
    })
  }
}

// Delete assignment (Educator only)
export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params

    // Check if educator owns the assignment
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'educator')

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      })
    }

    if (assignment.course.educator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this assignment'
      })
    }

    // Delete related submissions and certificates
    await AssignmentSubmission.deleteMany({ assignment: assignmentId })
    await Certificate.deleteMany({ assignment: assignmentId })

    // Delete assignment
    await Assignment.findByIdAndDelete(assignmentId)

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    })
  } catch (error) {
    console.error('Delete assignment error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete assignment'
    })
  }
}
