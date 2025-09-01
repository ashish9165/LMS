import { uploadToCloudinary } from '../utils/cloudinary.js'
import dotenv from 'dotenv'
dotenv.config()
export const isCloudinaryConfigured = () => {
  const configured = (
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_SECRET_KEY
  )
  return configured
}

export const getCloudinaryStatus = () => ({
  configured: isCloudinaryConfigured(),
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
})

// Upload an asset to Cloudinary if configured; otherwise return local /uploads URL
export const uploadAssetWithFallback = async (file, folder = 'lms-uploads') => {
  if (!file) return ''

  const configured = isCloudinaryConfigured()
  try {
    if (configured) {
      const result = await uploadToCloudinary(file.path, folder)
      return result.secure_url
    }
    console.warn('[Cloudinary] Not configured. Using local uploads URL.')
    return `/uploads/${file.filename}`
  } catch (error) {
    console.error('[Cloudinary] Upload failed. Falling back to local URL. Error:', error?.message || error)
    if (file && file.filename) {
      return `/uploads/${file.filename}`
    }
    return ''
  }
}

// Strict upload: requires Cloudinary to be configured and succeed.
// Throws if not configured or upload fails.
export const uploadAssetStrict = async (file, folder = 'lms-uploads') => {
  if (!file) throw new Error('No file provided for upload')
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET')
  }
  const result = await uploadToCloudinary(file.path, folder)
  if (!result?.secure_url) {
    throw new Error('Cloudinary upload did not return a secure_url')
  }
  return result.secure_url
}

export default {
  isCloudinaryConfigured,
  getCloudinaryStatus,
  uploadAssetWithFallback,
  uploadAssetStrict
}
