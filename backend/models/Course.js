import mongoose from 'mongoose'

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true
  },
  lectureDuration: {
    type: Number,
    required: true
  },
  lectureUrl: {
    type: String,
    required: true
  },
  isPreviewFree: {
    type: Boolean,
    default: false
  },
  lectureOrder: {
    type: Number,
    default: 1
  },
  lectureId: {
    type: String,
    required: true
  }
})

const chapterSchema = new mongoose.Schema({
  chapterTitle: {
    type: String,
    required: true
  },
  chapterContent: [lectureSchema],
  chapterOrder: {
    type: Number,
    default: 1
  },
  chapterId: {
    type: String,
    required: true
  }
})

const courseSchema = new mongoose.Schema({
  courseTitle: {
    type: String,
    required: true
  },
  courseDescription: {
    type: String,
    required: false,
    default: ''
  },
  coursePrice: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  courseThumbnail: {
    type: String,
    default: ''
  },
  courseContent: [chapterSchema],
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      completedLectures: [{
        type: String // lectureId
      }],
      lastAccessed: {
        type: Date,
        default: Date.now
      },
      assignmentCompleted: {
        type: Boolean,
        default: false
      },
      certificateEarned: {
        type: Boolean,
        default: false
      }
    }
  }],
  courseRatings: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.model('Course', courseSchema)
