const { admin } = require('../firebase-service-account');

/**
 * Middleware to verify Firebase authentication token
 * This middleware extracts the token from the Authorization header,
 * verifies it with Firebase Admin, and attaches the decoded user to the request
 */
const verifyToken = async (req, res, next) => {
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

module.exports = verifyToken;