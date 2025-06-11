const { admin, initializeFirebaseAdmin } = require('../firebase-service-account');
const User = require('../models/User');

// Initialize Firebase Admin
initializeFirebaseAdmin();

/**
 * Middleware to verify Firebase authentication token
 * This middleware extracts the token from the Authorization header,
 * verifies it with Firebase Admin, and attaches the decoded user to the request
 * It also checks for session timeout based on user's lastActive timestamp
 */
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - No token provided'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded user to request object
    
    // Check for session timeout
    const user = await User.findOne({ uid: decodedToken.uid });
    if (user) {
      const currentTime = new Date();
      const lastActive = new Date(user.lastActive);
      const timeoutMinutes = user.sessionTimeout || 30; // Default 30 minutes
      
      // Calculate time difference in minutes
      const timeDiff = (currentTime - lastActive) / (1000 * 60);
      
      if (timeDiff > timeoutMinutes) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          sessionExpired: true
        });
      }
      
      // Update last active time
      user.lastActive = currentTime;
      await user.save();
    }
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid token',
      error: error.message
    });
  }
};