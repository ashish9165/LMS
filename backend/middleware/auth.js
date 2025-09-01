import jwt from 'jsonwebtoken'
import User from '../models/User.js'


export const protect = async (req, res, next) => {
  try {
    let token

    // Get token from cookie
    if (req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      })
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'default-secret-key'
    const decoded = jwt.verify(token, secret)
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, user not found' 
      })
    }

    req.user = user
    req.userId = user._id
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    })
  }
}

// Admin auth middleware (requires educator role)
export const adminAuth = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      })
    }

    // Check if user has educator role or isEducator flag
    if (req.user.role !== 'educator' && !req.user.isEducator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Educator privileges required.',
        requiredRole: 'educator',
        currentRole: req.user.role
      })
    }

    next()
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return res.status(403).json({
      success: false,
      message: 'Access denied. Error in educator authentication.',
      requiredRole: 'educator',
      currentRole: req.user ? req.user.role : 'none'
    })
  }
}

// Optional auth middleware (doesn't require authentication)
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.cookies.token) {
      token = req.cookies.token
    }

    if (token) {
      const secret = process.env.JWT_SECRET || 'default-secret-key'
      const decoded = jwt.verify(token, secret)
      const user = await User.findById(decoded.userId).select('-password')
      if (user) {
        req.user = user
        req.userId = user._id
      }
    }

    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}