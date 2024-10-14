const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/authAdmin');
const authStudent = require('../middlewares/authStudent');
const { imageUpload, videoUpload, videoNotRequiredUpload, imageNotRequiredUpload } = require('../middlewares/uploads');

const podcastController = require('../controllers/podcastController');

router.get('/paginated', authAdmin, podcastController.getPaginatedPodcasts)
router.get('/', podcastController.getAllPodcasts)
router.get('/:id' , podcastController.getPodcastById)
router.post('/' , authAdmin, imageUpload, videoUpload, podcastController.createPodcast)
router.put('/:id' , authAdmin, imageNotRequiredUpload, videoNotRequiredUpload, podcastController.updatePodcastById)
router.delete('/:id' , authAdmin, podcastController.deletePodcastById)
router.get('/:id/add_like' , authStudent, podcastController.addLike)
router.delete('/:id/remove_like' , authStudent, podcastController.removeLike)
router.post('/:id/add_comment' , authStudent, podcastController.addComment)
router.delete('/:id/remove_comment/:comment_id' , authStudent, podcastController.removeComment)

module.exports = router;
