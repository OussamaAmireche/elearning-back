const express = require('express');
const router = express.Router({ mergeParams: true });
const authStudent = require('../middlewares/authStudent');
const studentOrTeacher = require('../middlewares/studentOrTeacher');
const { fileUpload } = require('../middlewares/uploads');

const forumController = require('../controllers/forumController');


router.post('/' , authStudent, fileUpload, forumController.askQuestion)
router.get('/' , studentOrTeacher, forumController.getQuestionsByCourse)
router.get('/:id' , studentOrTeacher, forumController.getQuestionById)
router.post('/:id/answer' , studentOrTeacher, fileUpload, forumController.answerQuestion)
router.delete('/:id' , studentOrTeacher, forumController.deleteQuestion)
router.delete('/:id/answer/:response_id' , studentOrTeacher, forumController.deleteAnswer)

module.exports = router;