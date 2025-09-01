import mongoose from 'mongoose'

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  assignmentSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AssignmentSubmission',
    required: true
  },
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generate a reasonably unique certificate number at creation time
      const random = Math.floor(Math.random() * 1e6).toString().padStart(6, '0')
      return `CERT-${Date.now()}-${random}`
    }
  },
  score: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date()
      date.setFullYear(date.getFullYear() + 2)
      return date
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model('Certificate', certificateSchema)
