import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import Enrollment from '../models/Enrollment.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email
    if (bio) updateData.bio = bio

    // Handle profile image upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'profile-images')
      updateData.imageUrl = result.secure_url
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (error) {
    console.error('Update user profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    })
  }
}

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    user.password = hashedPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    })
  }
}

// Delete user account
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Delete user account error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    })
  }
}

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Get enrollment statistics
    const enrollments = await Enrollment.find({ student: req.userId })
      .populate('course', 'courseTitle courseThumbnail')

    const totalEnrollments = enrollments.length
    const completedCourses = enrollments.filter(e => e.status === 'completed').length
    const inProgressCourses = enrollments.filter(e => e.status === 'active').length

    // Calculate total learning time
    let totalLearningTime = 0
    enrollments.forEach(enrollment => {
      if (enrollment.course && enrollment.course.courseContent) {
        enrollment.course.courseContent.forEach(chapter => {
          chapter.chapterContent.forEach(lecture => {
            if (enrollment.progress.completedLectures.includes(lecture.lectureId)) {
              totalLearningTime += lecture.lectureDuration
            }
          })
        })
      }
    })

    res.status(200).json({
      success: true,
      stats: {
        totalEnrollments,
        completedCourses,
        inProgressCourses,
        totalLearningTime, // in minutes
        joinDate: user.createdAt
      }
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    })
  }
}
