const express = require('express');
const router = express.Router();
const { authTeacher, authorizeTeacher } = require('../middlewares/authTeacher');
const { authAdmin } = require('../middlewares/authAdmin');
const authStudent = require('../middlewares/authStudent');
const { imageUpload, imageNotRequiredUpload } = require('../middlewares/uploads');

const courseController = require('../controllers/courseController');

router.get('/', courseController.getCourses)
router.get('/autocomplete', authAdmin, courseController.autocompleteCourses)
router.get('/paginated', authAdmin, courseController.getPaginatedCourses)
router.get('/my_courses',authTeacher, courseController.getMyCourses)
router.get('/:id' , courseController.getCourse)
router.put('/:id' , authTeacher, imageNotRequiredUpload, courseController.updateCourse)
router.delete('/:id/delete' , authAdmin, courseController.deleteCourseByAdmin)
router.delete('/:id' , authTeacher, courseController.deleteCourseById)
router.get('/:id/summary' , courseController.getCourseSummary)
router.post('/' , authTeacher, imageUpload, courseController.createCourse)
router.post('/:id/add_rating' , authStudent, courseController.addRating)
router.delete('/:id/remove_rating' , authStudent, courseController.removeRating)
router.get('/:id/enroll', authStudent, courseController.enrollCourse);
router.delete('/:id/unsubscribe', authStudent, courseController.unsubscribeCourse);

module.exports = router;