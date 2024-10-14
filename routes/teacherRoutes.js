const express = require('express');
const router = express.Router();
const { fileRequiredUpload, imageNotRequiredUpload, fileNotRequiredUpload } = require('../middlewares/uploads');
const { authTeacher } = require('../middlewares/authTeacher');
const { authAdmin } = require('../middlewares/authAdmin');

const teacherController = require('../controllers/teacherController');

router.get('/', authAdmin, teacherController.getTeachers)
router.get('/unactive', authAdmin, teacherController.getUnactiveTeachers)
router.post('/login', teacherController.login)
router.post('/signup' , fileRequiredUpload, imageNotRequiredUpload, teacherController.signup)
router.get('/profile' , authTeacher, teacherController.getMyProfile)
router.get('/:id' , teacherController.getTeacherById)
router.put('/:id/approve' , authAdmin, teacherController.approveTeacher)
router.put('/:id' , authTeacher, imageNotRequiredUpload, fileNotRequiredUpload, teacherController.updateTeacher)
router.delete('/:id' , authAdmin, teacherController.deleteTeacher)

module.exports = router;