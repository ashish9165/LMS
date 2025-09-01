import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import User from '../models/User.js'

// Get educator dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const educatorId = req.userId
    // Getting dashboard data for educator

    // Get all courses by educator
    const courses = await Course.find({ educator: educatorId })
      .populate('enrolledStudents.student', 'name email imageUrl')

          // Found courses for educator

    // Calculate total enrollments
    const totalEnrollments = courses.reduce((sum, course) => {
      return sum + (course.enrolledStudents ? course.enrolledStudents.length : 0)
    }, 0)

    // Calculate total revenue
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + ((course.enrolledStudents ? course.enrolledStudents.length : 0) * (course.coursePrice || 0))
    }, 0)

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({
      course: { $in: courses.map(c => c._id) }
    })
      .populate('student', 'name email imageUrl')
      .populate('course', 'courseTitle courseThumbnail')
      .sort({ enrolledAt: -1 })
      .limit(10)

    // Transform recent enrollments to include status
    const transformedEnrollments = recentEnrollments.map(enrollment => ({
      student: enrollment.student,
      course: enrollment.course,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status || 'active'
    }))

    // Get top performing courses
    const topCourses = courses
      .map(course => ({
        _id: course._id,
        courseTitle: course.courseTitle,
        courseThumbnail: course.courseThumbnail,
        enrollments: course.enrolledStudents ? course.enrolledStudents.length : 0,
        revenue: (course.enrolledStudents ? course.enrolledStudents.length : 0) * (course.coursePrice || 0),
        averageRating: course.courseRatings && course.courseRatings.length > 0
          ? course.courseRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / course.courseRatings.length
          : 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5)

    // Get monthly enrollment data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyEnrollments = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courses.map(c => c._id) },
          enrolledAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$enrolledAt' },
            month: { $month: '$enrolledAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    // Get student demographics - simplified approach
    let uniqueStudents = 0
    try {
      // Use the Enrollment model to get unique students instead of parsing from course.enrolledStudents
      const uniqueStudentIds = await Enrollment.distinct('student', {
        course: { $in: courses.map(c => c._id) }
      })
      uniqueStudents = uniqueStudentIds.length
      // Unique students found
    } catch (error) {
      console.error('Error counting unique students:', error)
      // Fallback: count from course.enrolledStudents
      const studentIds = new Set()
      courses.forEach(course => {
        if (course.enrolledStudents && Array.isArray(course.enrolledStudents)) {
          course.enrolledStudents.forEach(enrollment => {
            if (enrollment.student) {
              const studentId = typeof enrollment.student === 'object' && enrollment.student._id 
                ? enrollment.student._id.toString() 
                : enrollment.student.toString()
              studentIds.add(studentId)
            }
          })
        }
      })
      uniqueStudents = studentIds.size
    }

          // Dashboard response - totalCourses

    res.status(200).json({
      success: true,
      dashboard: {
        totalCourses: courses.length,
        totalEnrollments,
        totalRevenue,
        uniqueStudents,
        recentEnrollments: transformedEnrollments,
        topCourses,
        monthlyEnrollments
      }
    })
  } catch (error) {
    console.error('Get dashboard data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    })
  }
}

// Get course-specific analytics
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params
    const educatorId = req.userId

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId
    }).populate('enrolledStudents.student', 'name email imageUrl')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    // Calculate completion rates
    const totalLectures = course.courseContent.reduce((sum, chapter) => {
      return sum + chapter.chapterContent.length
    }, 0)

    const enrollments = await Enrollment.find({ course: courseId })
    const completionData = enrollments.map(enrollment => {
      const completedCount = enrollment.progress.completedLectures.length
      const completionRate = totalLectures > 0 ? (completedCount / totalLectures) * 100 : 0
      return {
        student: enrollment.student,
        completedLectures: completedCount,
        totalLectures,
        completionRate
      }
    })

    // Get average completion rate
    const averageCompletionRate = completionData.length > 0
      ? completionData.reduce((sum, data) => sum + data.completionRate, 0) / completionData.length
      : 0

    // Get chapter-wise progress
    const chapterProgress = course.courseContent.map(chapter => {
      const chapterCompletedCount = enrollments.reduce((count, enrollment) => {
        const chapterLectures = chapter.chapterContent.map(lecture => lecture.lectureId)
        const completedInChapter = enrollment.progress.completedLectures.filter(
          lectureId => chapterLectures.includes(lectureId)
        ).length
        return count + completedInChapter
      }, 0)

      return {
        chapterTitle: chapter.chapterTitle,
        totalLectures: chapter.chapterContent.length,
        completedLectures: chapterCompletedCount,
        completionRate: enrollments.length > 0
          ? (chapterCompletedCount / (chapter.chapterContent.length * enrollments.length)) * 100
          : 0
      }
    })

    res.status(200).json({
      success: true,
      analytics: {
        courseTitle: course.courseTitle,
        totalEnrollments: course.enrolledStudents.length,
        totalRevenue: course.enrolledStudents.length * course.coursePrice,
        averageRating: course.courseRatings.length > 0
          ? course.courseRatings.reduce((sum, r) => sum + r.rating, 0) / course.courseRatings.length
          : 0,
        totalRatings: course.courseRatings.length,
        averageCompletionRate,
        completionData,
        chapterProgress
      }
    })
  } catch (error) {
    console.error('Get course analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course analytics'
    })
  }
}

// Get enrolled students for a course
export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params
    const educatorId = req.userId

    const course = await Course.findOne({
      _id: courseId,
      educator: educatorId
    }).populate('enrolledStudents.student', 'name email imageUrl')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or unauthorized'
      })
    }

    // Get detailed enrollment data
    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email imageUrl')

    const studentsData = enrollments.map(enrollment => {
      const totalLectures = course.courseContent.reduce((sum, chapter) => {
        return sum + chapter.chapterContent.length
      }, 0)

      const completedLectures = enrollment.progress.completedLectures.length
      const completionRate = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0

      return {
        student: enrollment.student,
        enrolledAt: enrollment.enrolledAt,
        lastAccessed: enrollment.progress.lastAccessed,
        completedLectures,
        totalLectures,
        completionRate,
        status: completionRate === 100 ? 'completed' : 'in-progress',
        assignmentCompleted: enrollment.progress.assignmentCompleted || false,
        certificateEarned: enrollment.progress.certificateEarned || false
      }
    })

    res.status(200).json({
      success: true,
      students: studentsData
    })
  } catch (error) {
    console.error('Get enrolled students error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students'
    })
  }
}

// Get enrolled students data for dashboard
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educatorId = req.userId

    // Get all courses by educator
    const courses = await Course.find({ educator: educatorId })
      .populate('enrolledStudents.student', 'name email imageUrl')

    const enrolledStudentsData = []

    for (const course of courses) {
      const enrollments = await Enrollment.find({ course: course._id })
        .populate('student', 'name email imageUrl')

      for (const enrollment of enrollments) {
        enrolledStudentsData.push({
          student: enrollment.student,
          courseTitle: course.courseTitle,
          courseId: course._id,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status || 'active',
          assignmentCompleted: enrollment.progress.assignmentCompleted || false,
          certificateEarned: enrollment.progress.certificateEarned || false
        })
      }
    }

    // Sort by enrollment date (newest first)
    enrolledStudentsData.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))

    res.status(200).json({
      success: true,
      enrolledStudentsData
    })
  } catch (error) {
    console.error('Get enrolled students data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled students data'
    })
  }
}
