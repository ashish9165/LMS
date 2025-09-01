import { sendEmail, sendEnrollmentEmail, sendAssessmentCompletionEmail, sendCourseCompletionEmail } from '../services/emailService.js'

// Test email functionality
export const testEmail = async (req, res) => {
  try {
    const { email, type } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      })
    }

    let result

    switch (type) {
      case 'enrollment':
        result = await sendEnrollmentEmail(
          email,
          'Test Student',
          'Test Course',
          'Test Instructor'
        )
        break
      case 'assessment':
        result = await sendAssessmentCompletionEmail(
          email,
          'Test Student',
          'Test Course',
          'Test Assignment',
          85,
          85,
          true
        )
        break
      case 'completion':
        result = await sendCourseCompletionEmail(
          email,
          'Test Student',
          'Test Course',
          'Test Instructor'
        )
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid email type. Use: enrollment, assessment, or completion'
        })
    }

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Test ${type} email sent successfully`,
        messageId: result.messageId
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error || result.message
      })
    }
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    })
  }
}

// Get email configuration status
export const getEmailStatus = async (req, res) => {
  try {
    const isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    
    console.log('📧 Email status check:')
    console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Configured' : 'Not configured')
    console.log('- EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Configured' : 'Not configured')
    console.log('- Is configured:', isConfigured)
    
    res.status(200).json({
      success: true,
      configured: isConfigured,
      emailUser: isConfigured ? process.env.EMAIL_USER : null,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    })
  } catch (error) {
    console.error('Get email status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get email status'
    })
  }
}
