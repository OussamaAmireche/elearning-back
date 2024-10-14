const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher');
const Student = require('../models/Student');

const studentOrTeacher = async (req, res, next) => {
  try {
    // Get token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.teacherId){
        // Find teacher by ID and token
        const teacher = await Teacher.findById(decoded.teacherId);

        if (!teacher) {
        throw new Error();
        }

        // Attach teacher object and token to request object
        req.teacher = teacher;
        req.token = token;

        // Call the next middleware
        next();
    }else if(decoded.studentId){
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
    }else{
        throw new Error();
    }
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = studentOrTeacher;
