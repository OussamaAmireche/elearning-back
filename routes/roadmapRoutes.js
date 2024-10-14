const express = require('express');
const router = express.Router();
const { authTeacher } = require('../middlewares/authTeacher');
const { authAdmin } = require('../middlewares/authAdmin');
const authStudent = require('../middlewares/authStudent');
const { imageUpload, imageNotRequiredUpload } = require('../middlewares/uploads');


const roadmapController = require('../controllers/roadmapController');

router.post('/', authAdmin, imageUpload, roadmapController.createRoadmap)
router.get('/', roadmapController.getRoadmaps)
router.get('/paginated', authAdmin, roadmapController.getPaginatedRoadmaps)
router.get('/:id', roadmapController.getRoadmapById)
router.put('/:id', authAdmin, imageNotRequiredUpload, roadmapController.updateRoadmap)
router.delete('/:id', authAdmin, roadmapController.deleteRoadmap)
router.post('/:id/suggestions', authTeacher, roadmapController.addSuggestionToRoadmap)
router.delete('/:id/suggestions/:suggestion_id', authTeacher, roadmapController.removeSuggestionFromRoadmap)
router.get('/:id/teacher', roadmapController.teacherGetRoadmapById)

module.exports = router;