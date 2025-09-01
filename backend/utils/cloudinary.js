import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import dotenv from 'dotenv'
  
dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
})

const ensureConfigured = () => {
  if (!process.env.CLOUDINARY_NAME) throw new Error('Cloudinary CLOUDINARY_CLOUD_NAME is missing')
  if (!process.env.CLOUDINARY_API_KEY) throw new Error('Cloudinary CLOUDINARY_API_KEY is missing')
  if (!process.env.CLOUDINARY_SECRET_KEY) throw new Error('Cloudinary CLOUDINARY_API_SECRET is missing')
}

// Upload file to Cloudinary
export const uploadToCloudinary = async (filePath, folder = 'lms-uploads') => {
  try {
    ensureConfigured()
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    })

    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return result
  } catch (error) {
    // Delete local file if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    throw error
  }
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

// Get Cloudinary URL with transformations
export const getCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  }

  return cloudinary.url(publicId, defaultOptions)
}
