const Podcast = require('../models/podcast');

// Create a new podcast
const createPodcast = async (req, res) => {
  const { title, description, imagePath, videoPath } = req.body;
  const tags = req.body['tags[]'];
  const podcast = new Podcast({
    title,
    description,
    coverPath: imagePath,
    videoPath,
    tags,
  });
  try {
    const savedPodcast = await podcast.save();
    res.status(201).json({ message: 'Podcast created successfully', podcast: savedPodcast });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create podcast', details: error });
  }
};

// Get all podcasts
const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find();
    res.status(200).json({ podcasts });
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve podcasts', details: error });
    }
  };

const getPaginatedPodcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of podcasts per page
    const filter = req.query.filter; // Filter keyword for podcast title or description

    // Build the query object for filtering podcasts
    const query = {};

    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for podcast title
        { tags: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for podcast description
      ];
    }

    // Count the total number of podcasts matching the filter
    const count = await Podcast.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Validate the current page number
    if (page > totalPages) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Fetch the podcasts with pagination
    const podcasts = await Podcast.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ podcasts, totalPages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get podcasts', details: err.message });
  }
};

// Get a podcast by ID
const getPodcastById = async (req, res) => {
  const { id } = req.params;
  try {
    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    res.status(200).json({ podcast });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve podcast', details: error });
  }
};

// Update a podcast by ID
const updatePodcastById = async (req, res) => {
  const { id } = req.params;
  const { title, description, imagePath, videoPath } = req.body;
  const tags = req.body['tags[]'];
  try {
    const podcast = await Podcast.findById(id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    podcast.title = title || podcast.title;
    podcast.description = description || podcast.description;
    podcast.coverPath = imagePath || podcast.coverPath;
    podcast.videoPath = videoPath || podcast.videoPath;
    podcast.tags = tags || podcast.tags;
    const updatedPodcast = await podcast.save();
    res.status(200).json({ message: 'Podcast updated successfully', podcast: updatedPodcast });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update podcast', details: error });
  }
};

// Delete a podcast by ID
const deletePodcastById = async (req, res) => {
  const { id } = req.params;
  try {
    const podcast = await Podcast.findByIdAndDelete(id);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }
    res.status(200).json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete podcast', details: error });
  }
};

// Controller method to add a like to a podcast
const addLike = async (req, res) => {
    const podcastId = req.params.id;
    const studentId = req.student._id;

    try {
        // Check if the podcast exists
        const podcast = await Podcast.findById(podcastId);
        if (!podcast) {
        return res.status(404).json({ error: 'Podcast not found' });
        }

        // Check if the student has already liked the podcast
        if (podcast.reactions.likes.includes(studentId)) {
        return res.status(400).json({ error: 'You have already liked this podcast' });
        }

        // Add the like to the podcast
        podcast.reactions.likes.push(studentId);
        const savedPodcast = await podcast.save();

        res.status(200).json({ message: 'Like added successfully', podcast: savedPodcast });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add like', details: err });
    }
};

// Controller method to remove a like from a podcast
const removeLike = async (req, res) => {
  const podcastId = req.params.id;
  const studentId = req.student._id;

  try {
    // Check if the podcast exists
    const podcast = await Podcast.findById(podcastId);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // Check if the student has already liked the podcast
    const likeIndex = podcast.reactions.likes.findIndex((like) => like.toString() === studentId.toString());
    if (likeIndex === -1) {
      return res.status(400).json({ error: 'You have not liked this podcast' });
    }

    // Remove the like from the podcast
    podcast.reactions.likes.splice(likeIndex, 1);
    const savedPodcast = await podcast.save();

    res.status(200).json({ message: 'Like removed successfully', podcast: savedPodcast });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove like', details: err });
  }
};


    // Controller method to add a comment to a podcast
    const addComment = async (req, res) => {
    const podcastId = req.params.id;
    const studentId = req.student._id;
    const { comment } = req.body;

    try {
        // Check if the podcast exists
        const podcast = await Podcast.findById(podcastId);
        if (!podcast) {
        return res.status(404).json({ error: 'Podcast not found' });
        }

        // Add the comment to the podcast
        const newComment = { studentId, comment };
        podcast.reactions.comments.push(newComment);
        const savedPodcast = await podcast.save();

        res.status(200).json({ message: 'Comment added successfully', podcast: savedPodcast });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment', details: err });
    }
};

const removeComment = async (req, res) => {
  const podcastId = req.params.id;
  const commentId = req.params.comment_id;

  try {
      const podcast = await Podcast.findById(podcastId);

      if (!podcast) {
          return res.status(404).json({ error: 'Podcast not found' });
      }

      const commentIndex = podcast.reactions.comments.findIndex(comment => comment._id.toString() === commentId.toString());

      if (commentIndex === -1) {
          return res.status(404).json({ error: 'Comment not found' });
      }

      // Check if the student who made the request is the author of the comment
      if (podcast.reactions.comments[commentIndex].studentId.toString() !== req.student._id.toString()) {
          return res.status(401).json({ error: 'You are not authorized to delete this comment' });
      }

      podcast.reactions.comments.splice(commentIndex, 1);
      await podcast.save();

      res.json({ message: 'Comment removed successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to remove comment', details: err });
  }
};



module.exports = {
  createPodcast,
  getPodcastById,
  updatePodcastById,
  deletePodcastById,
  addLike,
  removeLike,
  addComment,
  removeComment,
  getPaginatedPodcasts,
  getAllPodcasts
};
