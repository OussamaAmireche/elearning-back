const express = require('express');
const router = express.Router();
const authStudent = require('../middlewares/authStudent');
const { authAdmin } = require('../middlewares/authAdmin');
const { imageNotRequiredUpload } = require('../middlewares/uploads');

const studentController = require('../controllers/studentController');

router.get('/', authAdmin, studentController.getStudents)
router.post('/login', studentController.login)
router.post('/signup' , imageNotRequiredUpload, studentController.signup)
router.post('/forget-password' , studentController.sendResetPasswordEmail)
router.post('/reset-password' , studentController.resetPassword)
router.get('/profile' , authStudent, studentController.getMyProfile)
router.get('/:id' , studentController.getStudentById)
router.put('/:id' , authStudent, imageNotRequiredUpload, studentController.updateStudent)
router.delete('/:id' , authAdmin, studentController.deleteStudent)

module.exports = router;