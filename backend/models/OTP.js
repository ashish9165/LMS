import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index - documents will be automatically deleted after expiresAt
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Create compound index for email and OTP
otpSchema.index({ email: 1, otp: 1 })

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt.getTime()
}

// Method to mark OTP as used
otpSchema.methods.markAsUsed = function() {
  this.isUsed = true
  return this.save()
}

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Static method to create OTP with expiration
otpSchema.statics.createOTP = function(email) {
  const otp = this.generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  
  return this.create({
    email,
    otp,
    expiresAt
  })
}

// Static method to verify OTP (without marking as used)
otpSchema.statics.verifyOTP = async function(email, otp) {
  // OTP.verifyOTP called
  
  const otpDoc = await this.findOne({ 
    email, 
    otp, 
    isUsed: false,
    expiresAt: { $gt: new Date() }
  })
  
  // OTP document found
  
  return !!otpDoc
}

// Static method to verify and consume OTP (marks as used)
otpSchema.statics.verifyAndConsumeOTP = async function(email, otp) {
  // OTP.verifyAndConsumeOTP called
  
  const otpDoc = await this.findOne({ 
    email, 
    otp, 
    isUsed: false,
    expiresAt: { $gt: new Date() }
  })
  
  // OTP document found for consumption
  
  if (otpDoc) {
    // Marking OTP as used
    await otpDoc.markAsUsed()
    return true
  }
  
  return false
}

// Static method to clean expired OTPs
otpSchema.statics.cleanExpiredOTPs = async function() {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  })
}

const OTP = mongoose.model('OTP', otpSchema)

export default OTP
