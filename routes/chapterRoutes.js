const express = require('express');
const router = express.Router({ mergeParams: true });
const { authTeacher, authorizeTeacher } = require('../middlewares/authTeacher');
const authStudent = require('../middlewares/authStudent');
const { fileUpload, videoUpload, videoNotRequiredUpload } = require('../middlewares/uploads');

const chapterController = require('../controllers/chapterController');


router.post('/' , authTeacher, authorizeTeacher, fileUpload, videoUpload, chapterController.createChapter)
router.get('/:id' , chapterController.getChapterById)
router.put('/:id' , authTeacher, authorizeTeacher, fileUpload, videoNotRequiredUpload, chapterController.updateChapter)
router.delete('/:id' , authTeacher, authorizeTeacher, chapterController.deleteChapter)
router.post('/:id/mark_completed' , authStudent, chapterController.markChapterAsCompleted)
router.delete('/:id/mark_not_completed' , authStudent, chapterController.markChapterAsNotCompleted)

module.exports = router;