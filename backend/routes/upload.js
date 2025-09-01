import express from 'express'
import { upload } from '../middleware/upload.js'
import { uploadImage } from '../controllers/uploadController.js'
import { getCloudinaryStatus } from '../services/cloudinaryService.js'

const router = express.Router()

router.post('/image', upload.single('image'), uploadImage)

router.get('/cloudinary-status', (req, res) => {
  const status = getCloudinaryStatus()
  res.json({ success: true, status })
})

export default router
