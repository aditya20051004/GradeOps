// middleware/authMiddleware.js
// This is like a security guard at every door
// It checks if the user has a valid token before letting them in

const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Get token from request header
  const token = req.headers.authorization?.split(' ')[1];

  // If no token found, reject the request
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. Please login first.' 
    });
  }

  try {
    // Verify the token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request so other routes can use it
    req.user = decoded;
    
    // Move on to the next function
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token. Please login again.' 
    });
  }
};

// Check if user is an instructor
const instructorOnly = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ 
      message: 'Access denied. Instructors only.' 
    });
  }
  next();
};

module.exports = { protect, instructorOnly };