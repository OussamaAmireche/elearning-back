const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authStudent = async (req, res, next) => {
  try {
    // Get token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find student by ID and token
    const student = await Student.findById(decoded.studentId);

    if (!student) {
      throw new Error();
    }

    // Attach student object and token to request object
    req.student = student;
    req.token = token;

    // Call the next middleware
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = authStudent;
