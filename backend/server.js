import dotenv from 'dotenv';
dotenv.config();  // Load .env variables at the very top

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './configs/mogodb.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';
import assignmentRoutes from './routes/assignments.js';
import emailRoutes from './routes/email.js';
import razorpayRoutes from './routes/razorpay.js';
// import { getCloudinaryStatus } from './services/cloudinaryService.js';

const app = express();

await connectDB();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests or same-origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve local uploads (for thumbnails when Cloudinary isn't used)
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/razorpay', razorpayRoutes);

console.log('✅ Razorpay routes mounted at /api/razorpay');

// Default route
app.get('/', (req, res) => {
  res.send('LMS Backend API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // console.log('Cloudinary configured:', status.configured, '(cloud_name:', status.cloud_name, 'api_key:', status.api_key, 'api_secret:', status.api_secret, ')');
});



