import { uploadAssetWithFallback } from '../services/cloudinaryService.js'

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' })
    }

    const url = await uploadAssetWithFallback(req.file, 'misc-uploads')

    if (!url) {
      return res.status(500).json({ success: false, message: 'Failed to upload image' })
    }

    return res.status(200).json({ success: true, url })
  } catch (error) {
    console.error('Upload image error:', error)
    return res.status(500).json({ success: false, message: 'Upload failed' })
  }
}

export default { uploadImage }
