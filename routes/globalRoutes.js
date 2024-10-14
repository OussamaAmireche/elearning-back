const express = require('express');
const router = express.Router();
const authStudent = require('../middlewares/authStudent');

const courseController = require('../controllers/courseController');

router.get('/dashboard', authStudent, courseController.getEnrolledCoursesWithCompletionRate)
router.get('/forums', authStudent, courseController.getEnrolledCourses)

module.exports = router;