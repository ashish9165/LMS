import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter with proper configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "ankusingh06072006@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "uepikknlolzplsgk",
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    // Email Configuration Debug
    console.error("❌ Email transporter verification failed:", error.message);
  } else {
    // Email transporter is ready
  }
});



// Email templates
const emailTemplates = {
  enrollment: (studentName, courseTitle, educatorName) => ({
    subject: `Welcome to ${courseTitle}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to Your Course!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${studentName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Congratulations! You have successfully enrolled in <strong>${courseTitle}</strong>.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Course Details:</h3>
            <p style="margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Instructor:</strong> ${educatorName}</p>
            <p style="margin: 5px 0;"><strong>Enrollment Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You can now access your course content and start learning. Make sure to complete all lectures and assignments to get your certificate.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/my-enrollments" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Access Your Course
            </a>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions, feel free to reach out to your instructor or our support team.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Happy learning!<br>
            <strong>The Learning Platform Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  assessmentCompletion: (studentName, courseTitle, assignmentTitle, score, percentage, passed) => ({
    subject: `Assessment Results: ${assignmentTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${passed ? '#4CAF50' : '#f44336'} 0%, ${passed ? '#45a049' : '#d32f2f'} 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">
            ${passed ? '🎉 Congratulations!' : '📝 Assessment Complete'}
          </h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${studentName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your assessment for <strong>${assignmentTitle}</strong> in <strong>${courseTitle}</strong> has been completed and graded.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${passed ? '#4CAF50' : '#f44336'};">
            <h3 style="color: #333; margin-top: 0;">Assessment Results:</h3>
            <p style="margin: 5px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
            <p style="margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Score:</strong> ${score} points</p>
            <p style="margin: 5px 0;"><strong>Percentage:</strong> ${percentage}%</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> 
              <span style="color: ${passed ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                ${passed ? 'PASSED ✅' : 'NOT PASSED ❌'}
              </span>
            </p>
            <p style="margin: 5px 0;"><strong>Completed:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          ${passed ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <p style="margin: 0; color: #2e7d32; font-weight: bold;">
                🎉 Great job! You've successfully passed this assessment. You're one step closer to completing your course!
              </p>
            </div>
          ` : `
            <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
              <p style="margin: 0; color: #c62828;">
                Don't worry! You can retake this assessment to improve your score. Review the course material and try again.
              </p>
            </div>
          `}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/my-enrollments" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Your Progress
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Keep up the great work!<br>
            <strong>The Learning Platform Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  courseCompletion: (studentName, courseTitle, educatorName) => ({
    subject: `🎉 Course Completed: ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎓 Course Completed!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Congratulations ${studentName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            You have successfully completed <strong>${courseTitle}</strong>! This is a significant achievement and you should be proud of your dedication and hard work.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #333; margin-top: 0;">Course Completion Details:</h3>
            <p style="margin: 5px 0;"><strong>Course:</strong> ${courseTitle}</p>
            <p style="margin: 5px 0;"><strong>Instructor:</strong> ${educatorName}</p>
            <p style="margin: 5px 0;"><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Certificate:</strong> Available for download</p>
          </div>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; color: #2e7d32; font-weight: bold;">
              🎉 Your certificate is ready! You can download it from your dashboard.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/certificates" style="background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; margin-right: 10px;">
              Download Certificate
            </a>
            <a href="${process.env.FRONTEND_URL}/Course-List" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Explore More Courses
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing our platform for your learning journey!<br>
            <strong>The Learning Platform Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  passwordResetOTP: (userName, otp) => ({
    subject: `🔐 Password Reset OTP - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password. Use the OTP code below to complete the password reset process.
          </p>
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626; text-align: center;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 20px;">Your OTP Code:</h3>
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">
              ⚠️ Important Security Notes:
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #991b1b;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Never share this OTP with anyone</li>
              <li>If you didn't request this reset, please ignore this email</li>
            </ul>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Enter this OTP code in the password reset form to continue. If you have any issues, please contact our support team.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            <strong>The Learning Platform Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  registrationOTP: (userName, otp) => ({
    subject: `🎉 Welcome! Verify Your Email - ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Welcome!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for joining our learning platform! To complete your registration, please verify your email address using the OTP code below.
          </p>
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669; text-align: center;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 20px;">Your Verification Code:</h3>
            <div style="background: #059669; color: white; padding: 20px; border-radius: 8px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-weight: bold;">
              ✅ Verification Details:
            </p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #065f46;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Enter this code in the registration form to verify your email</li>
              <li>After verification, you'll be able to access your account</li>
            </ul>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Once verified, you'll have access to all our courses and learning resources. Welcome to the community!
          </p>
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            <strong>The Learning Platform Team</strong>
          </p>
        </div>
      </div>
    `
  })
}

// Send email function
export const sendEmail = async (to, template, data) => {
  try {
    // Email service - Starting email send
    
    // Get email content
    const emailContent = emailTemplates[template](...data)
    
    const mailOptions = {
      from: process.env.EMAIL_USER || "ankusingh06072006@gmail.com",
      to,
      subject: emailContent.subject,
      html: emailContent.html
    }

    // Sending email
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully!')
    console.log('📧 Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email send error:', error.message)
    console.error('❌ Error code:', error.code)
    console.error('❌ Error command:', error.command)
    return { success: false, error: error.message }
  }
}

// Specific email functions
export const sendEnrollmentEmail = async (studentEmail, studentName, courseTitle, educatorName) => {
  return await sendEmail(studentEmail, 'enrollment', [studentName, courseTitle, educatorName])
}

export const sendAssessmentCompletionEmail = async (studentEmail, studentName, courseTitle, assignmentTitle, score, percentage, passed) => {
  return await sendEmail(studentEmail, 'assessmentCompletion', [studentName, courseTitle, assignmentTitle, score, percentage, passed])
}

export const sendCourseCompletionEmail = async (studentEmail, studentName, courseTitle, educatorName) => {
  return await sendEmail(studentEmail, 'courseCompletion', [studentName, courseTitle, educatorName])
}

export const sendPasswordResetOTPEmail = async (userEmail, userName, otp) => {
  return await sendEmail(userEmail, 'passwordResetOTP', [userName, otp])
}

export const sendRegistrationOTPEmail = async (userEmail, userName, otp) => {
  return await sendEmail(userEmail, 'registrationOTP', [userName, otp])
}
