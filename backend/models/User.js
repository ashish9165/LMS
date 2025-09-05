import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    validate: {
      validator: function(v) {
        return !/\s/.test(v); // No spaces allowed
      },
      message: 'Password cannot contain spaces'
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'educator'],
    default: 'student'
  },
  isEducator: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

export default mongoose.model('User', userSchema)