import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  studentAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  points: {
    type: Number,
    default: 0
  }
})

const assignmentSubmissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in minutes
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  attempts: {
    type: Number,
    default: 1
  }
})

// Ensure unique submission per student per assignment
assignmentSubmissionSchema.index({ student: 1, assignment: 1 }, { unique: true })

export default mongoose.model('AssignmentSubmission', assignmentSubmissionSchema)
