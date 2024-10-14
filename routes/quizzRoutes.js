const express = require('express');
const router = express.Router({ mergeParams: true });
const { authTeacher, authorizeTeacher } = require('../middlewares/authTeacher');
const authStudent = require('../middlewares/authStudent');

const quizzController = require('../controllers/quizzController');


router.post('/' , authTeacher, authorizeTeacher, quizzController.createQuizz)
router.get('/:id' , quizzController.getQuizzById)
router.post('/:id/evaluate' , authStudent, quizzController.evaluateQuizz)
router.get('/:id/mark_not_completed' , authStudent, quizzController.markQuizzAsNotCompleted)
router.put('/:id' , authTeacher, authorizeTeacher, quizzController.updateQuizz)
router.delete('/:id' , authTeacher, authorizeTeacher, quizzController.deleteQuizz)

module.exports = router;