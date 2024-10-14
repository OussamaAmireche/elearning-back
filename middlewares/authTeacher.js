const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');
const Course = require('../models/Course');

const authTeacher = async (req, res, next) => {
  try {
    // Get token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find teacher by ID and token
    const teacher = await Teacher.findById(decoded.teacherId);
    
    if (!teacher) {
      throw new Error();
    }

    if(teacher.accountStatus !== 'active'){
      return res.status(401).send({ error: 'You are not allowed to access this route' });
    }

    // Attach teacher object and token to request object
    req.teacher = teacher;
    req.token = token;

    // Call the next middleware
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const authorizeTeacher = async (req, res, next) => {
  try {

    // Get token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decodedToken.teacherId;

    const course = await Course.findById(req.params.course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacherId.toString() !== teacherId) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    req.teacherId = teacherId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

module.exports = { authTeacher, authorizeTeacher };
