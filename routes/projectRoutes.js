const express = require('express');
const router = express.Router({ mergeParams: true });
const authStudent = require('../middlewares/authStudent');
const { authTeacher, authorizeTeacher } = require('../middlewares/authTeacher');
const { fileUpload, videoUpload, fileRequiredUpload, videoNotRequiredUpload } = require('../middlewares/uploads');

const projectController = require('../controllers/projectController');


router.post('/' , authTeacher, authorizeTeacher, fileUpload, videoUpload, projectController.createProject)
router.get('/:id' , projectController.getProjectById)
router.get('/:id/teacher' , authTeacher, authorizeTeacher, projectController.teacherGetProjectById)
router.get('/:id/student' , authStudent, projectController.studentGetProjectById)
router.post('/:id/upload' , authStudent, fileRequiredUpload, projectController.uploadProject)
router.post('/:id/approve/:project_upload_id' , authTeacher, authorizeTeacher, projectController.approveProject)
router.delete('/:id/reject/:project_upload_id' , authTeacher, authorizeTeacher, projectController.rejectProject)
router.delete('/:id/mark_not_completed/:project_upload_id' , authStudent, projectController.markProjectAsNotCompleted)
router.delete('/:id/remove/:project_id' , authStudent, projectController.removeProjectUpload);
router.put('/:id' , authTeacher, authorizeTeacher, fileUpload, videoNotRequiredUpload, projectController.updateProject)
router.delete('/:id' , authTeacher, authorizeTeacher, projectController.deleteProject)

module.exports = router;