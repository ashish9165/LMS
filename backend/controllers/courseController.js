import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'
import { uploadAssetStrict } from '../services/cloudinaryService.js'
import { sendEnrollmentEmail } from '../services/emailService.js'

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      courseContent
    } = req.body

    // Require thumbnail file and upload to Cloudinary strictly
    let courseThumbnail = ''
    if (req.file) {
      courseThumbnail = await uploadAssetStrict(req.file, 'course-thumbnails')
    } else {
      return res.status(400).json({ success: false, message: 'Thumbnail image is required' })
    }

    // Safely parse courseContent
    let parsedContent = []
    try {
      parsedContent = typeof courseContent === 'string' ? JSON.parse(courseContent) : (Array.isArray(courseContent) ? courseContent : [])
    } catch (_) {
      parsedContent = []
    }

    const price = Number(coursePrice)
    const off = Number(discount)

    // Validate price and discount
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Course price cannot be negative'
      })
    }

    if (off < 0 || off > 100) {
      return res.status(400).json({
        success: false,
        message: 'Discount must be between 0 and 100 percent'
      })
    }

    const course = await Course.create({
      courseTitle,
      courseDescription: courseDescription || '',
      coursePrice: Number.isFinite(price) ? price : 0,
      discount: Number.isFinite(off) ? off : 0,
      courseThumbnail,
      courseContent: parsedContent,
      educator: req.userId
    })

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create course'
    })
  }
}

// Get all courses (public)
export const getAllCourses = async (req, res) => {
  try {
    const { search, category, sort, published } = req.query
    // Show all by default; if published=true, filter published only
    let query = {}
    if (published === 'true') {
      query.isPublished = true
    }

    // Search functionality
    if (search) {
      query.courseTitle = { $regex: search, $options: 'i' }
    }

    // Category filter
    if (category) {
      query.category = category
    }

    // Sorting
    let sortOption = { createdAt: -1 }
    if (sort === 'price-low') sortOption = { coursePrice: 1 }
    if (sort === 'price-high') sortOption = { coursePrice: -1 }
    if (sort === 'rating') sortOption = { 'courseRatings.rating': -1 }

    const courses = await Course.find(query)
      .populate('educator', 'name email imageUrl')
      .sort(sortOption)

    res.status(200).json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get all courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    })
  }
}

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findById(id)
      .populate('educator', 'name email imageUrl')
      .populate('enrolledStudents.student', 'name email imageUrl')
      .populate('courseRatings.student', 'name imageUrl')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if user is enrolled and has completed all videos
    let canAccessAssignments = false
    if (req.userId) {
      const enrollment = await Enrollment.findOne({
        student: req.userId,
        course: id
      })
      
      if (enrollment) {
        const totalLectures = course.courseContent.reduce((total, chapter) => {
          return total + chapter.chapterContent.length
        }, 0)
        const completedLectures = enrollment.progress.completedLectures.length
        canAccessAssignments = completedLectures >= totalLectures
      }
    }

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        canAccessAssignments
      }
    })
  } catch (error) {
    console.error('Get course by ID error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course'
    })
  }
}

// Get educator's courses
export const getEducatorCourses = async (req, res) => {
  try {
    // Check if userId exists
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    const courses = await Course.find({ educator: req.userId })
      .populate('enrolledStudents.student', 'name email imageUrl')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      courses
    })
  } catch (error) {
    console.error('Get educator courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses'
    })
  }
}

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = { ...req.body }

    // Handle file upload
    if (req.file) {
      // Strictly require Cloudinary upload if a new file is provided
      updateData.courseThumbnail = await uploadAssetStrict(req.file, 'course-thumbnails')
    }

    // Parse course content if provided
    if (updateData.courseContent) {
      updateData.courseContent = JSON.parse(updateData.courseContent)
    }

    // Validate price and discount if provided
    if (updateData.coursePrice !== undefined) {
      const price = Number(updateData.coursePrice)
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Course price cannot be negative'
        })
      }
    }

    if (updateData.discount !== undefined) {
      const discount = Number(updateData.discount)
      if (discount < 0 || discount > 100) {
        return res.status(400).json({
          success: false,
          message: 'Discount must be between 0 and 100 percent'
        })
      }
    }

    const course = await Course.findOneAndUpdate(
      { _id: id, educator: req.userId },
      updateData,
      { new: true, runValidators: true }
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update course'
    })
  }
}

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params
    const course = await Course.findOneAndDelete({ _id: id, educator: req.userId })

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    // Delete related enrollments
    await Enrollment.deleteMany({ course: id })

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete course'
    })
  }
}

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    // Check if course exists
    const course = await Course.findById(courseId).populate('educator', 'name email')
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    })

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      })
    }

    // Get student details
    const student = await User.findById(req.userId)
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.userId,
      course: courseId
    })

    // Add to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        enrolledStudents: {
          student: req.userId,
          enrolledAt: new Date()
        }
      }
    })

    // Send enrollment email
    let emailSent = false
    try {
      // Attempting to send enrollment email
      const emailResult = await sendEnrollmentEmail(
        student.email,
        student.name,
        course.courseTitle,
        course.educator.name
      )
      
      if (emailResult.success) {
        // Enrollment email sent successfully
        emailSent = true
      } else {
        console.error('❌ Failed to send enrollment email:', emailResult.error || emailResult.message)
      }
    } catch (emailError) {
      console.error('❌ Exception while sending enrollment email:', emailError)
      // Don't fail the enrollment if email fails
    }

    res.status(201).json({
      success: true,
      message: `Enrolled successfully${emailSent ? ' and confirmation email sent' : ''}`,
      enrollment,
      emailSent
    })
  } catch (error) {
    console.error('Enroll in course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course'
    })
  }
}

// Get user's enrolled courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.userId })
      .populate({
        path: 'course',
        populate: {
          path: 'educator',
          select: 'name email imageUrl'
        }
      })
      .sort({ enrolledAt: -1 })

    res.status(200).json({
      success: true,
      enrollments
    })
  } catch (error) {
    console.error('Get enrolled courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    })
  }
}

// Update lecture progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params

    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    })

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Add lecture to completed if not already completed
    if (!enrollment.progress.completedLectures.includes(lectureId)) {
      enrollment.progress.completedLectures.push(lectureId)
    }

    enrollment.progress.lastAccessed = new Date()
    await enrollment.save()

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: enrollment.progress
    })
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    })
  }
}

// Rate a course
export const rateCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const { rating: incomingRating, review } = req.body

    // Coerce and validate rating
    const rating = Number(incomingRating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' })
    }

    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      student: req.userId,
      course: courseId
    })

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You must be enrolled to rate this course'
      })
    }

    // Update enrollment rating
    enrollment.rating = { rating, review }
    await enrollment.save()

    // Update course rating
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' })
    }
    const existingRatingIndex = (course.courseRatings || []).findIndex(
      r => r.student && r.student.toString() === req.userId
    )

    if (existingRatingIndex >= 0) {
      course.courseRatings[existingRatingIndex] = {
        student: course.courseRatings[existingRatingIndex].student, // keep ObjectId instance
        rating,
        review,
        createdAt: new Date()
      }
    } else {
      course.courseRatings.push({
        student: req.userId,
        rating,
        review
      })
    }

    // Ensure Mongoose detects the array modification
    course.markModified('courseRatings')
    await course.save()

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully'
    })
  } catch (error) {
    console.error('Rate course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    })
  }
}

// Get course analytics for educator
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findOne({
      _id: courseId,
      educator: req.userId
    }).populate('enrolledStudents.student', 'name email imageUrl')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    // Calculate analytics
    const totalEnrollments = course.enrolledStudents.length
    const totalRevenue = totalEnrollments * course.coursePrice
    const averageRating = course.courseRatings.length > 0
      ? course.courseRatings.reduce((sum, r) => sum + r.rating, 0) / course.courseRatings.length
      : 0

    res.status(200).json({
      success: true,
      analytics: {
        totalEnrollments,
        totalRevenue,
        averageRating,
        totalRatings: course.courseRatings.length,
        enrolledStudents: course.enrolledStudents
      }
    })
  } catch (error) {
    console.error('Get course analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    })
  }
}

// Update enrollment status (for educators)
export const updateEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params
    const { status } = req.body

    // Validate status
    const validStatuses = ['active', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: active, completed, cancelled'
      })
    }

    // Find the enrollment and verify the educator owns the course
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course', 'educator')

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check if the educator owns the course
    if (enrollment.course.educator.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this enrollment'
      })
    }

    // Update the status
    enrollment.status = status
    await enrollment.save()

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      enrollment
    })
  } catch (error) {
    console.error('Update enrollment status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment status'
    })
  }
}
