const express = require('express');
const router = express.Router({ mergeParams: true });
const { authTeacher, authorizeTeacher } = require('../middlewares/authTeacher');

const partController = require('../controllers/partController');


router.post('/' , authTeacher, authorizeTeacher, partController.createPart)
router.get('/:id' , authTeacher, authorizeTeacher, partController.getPartSummary)
router.put('/:id' , authTeacher, authorizeTeacher, partController.updatePart)
router.delete('/:id' , authTeacher, authorizeTeacher, partController.deletePart)

module.exports = router;