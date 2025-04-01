const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    // Get auth header
    const authHeader = req.headers.authorization;
    
    // Check if auth header exists
    if (!authHeader) {
      console.log('Auth header missing');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // For Bearer token authentication
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]; // Get token after "Bearer "
      
      // Token validation logic
      if (!token) {
        console.log('Token missing after Bearer prefix');
        return res.status(401).json({
          success: false,
          message: 'Access denied. No token provided after Bearer prefix.'
        });
      }
      
      // For development/testing, accept any token starting with "admin-token-"
      if (token.startsWith('admin-token-')) {
        req.user = { role: 'admin' }; // Set user role for route handlers
        return next();
      }
      
      // For production, validate against environment variable
      if (process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
        req.user = { role: 'admin' };
        return next();
      }
      
      // Add support for Base64 encoded token
      try {
        // Attempt to decode the Base64 token to JSON
        const decodedToken = JSON.parse(Buffer.from(token, 'base64').toString());
        
        // Check if it has admin privileges
        if (decodedToken.isAdmin === true && decodedToken.email === 'admin@iiitg.ac.in') {
          req.user = { 
            role: 'admin',
            email: decodedToken.email 
          };
          return next();
        }
      } catch (decodeError) {
        console.log('Failed to decode Base64 token:', decodeError.message);
        // Continue to next validation step if this fails
      }
      
      // If we get here, token is invalid
      console.log('Invalid token value:', token);
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
    
    // If we get here, token format is invalid
    console.log('Invalid auth header format:', authHeader);
    return res.status(401).json({
      success: false,
      message: 'Access denied. Invalid token format. Use Bearer authentication.'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

module.exports = { adminAuth };