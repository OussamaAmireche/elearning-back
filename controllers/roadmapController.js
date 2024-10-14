const Roadmap = require('../models/roadmap');
const Course = require('../models/Course');
var mongoose = require('mongoose');

const createRoadmap = async function (req, res) {
  try {
    const { title, description, imagePath } = req.body;
    let courses = req.body['courses[]'];
    courses = courses.map(course => JSON.parse(course));
    const courseIds = courses.map(course => course.courseId);
    const existingCourses = await Course.find({_id: {$in: courseIds}});

    if (existingCourses.length !== courseIds.length) {
      const nonExistingCourseIds = courseIds.filter(courseId => !existingCourses.some(course => course._id.equals(courseId)));
      return res.status(400).json({ error: `The following course ids do not exist: ${nonExistingCourseIds}` });
    }

    const roadmap = new Roadmap({
      title,
      description,
      coverPath: imagePath,
      courses
    });
    await roadmap.save();
    res.status(201).json({ message: 'Roadmap created successfully', roadmap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRoadmap = async (req, res) => {
  const roadmapId = req.params.id;
  const { title, description, imagePath } = req.body;
  console.log(imagePath);
  let courses = req.body['courses[]'];
  if(courses){
    courses = courses.map(course => JSON.parse(course));
    const courseIds = courses.map(course => course.courseId);
    const existingCourses = await Course.find({_id: {$in: courseIds}});

    if (existingCourses.length !== courseIds.length) {
      const nonExistingCourseIds = courseIds.filter(courseId => !existingCourses.some(course => course._id.equals(courseId)));
      return res.status(400).json({ error: `The following course ids do not exist: ${nonExistingCourseIds}` });
    }
  }
  try {
    // Find the roadmap by ID
    const roadmap = await Roadmap.findOne({ _id: roadmapId });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Update the roadmap fields
    roadmap.title = title || roadmap.title;
    roadmap.description = description || roadmap.description;
    roadmap.courses = courses || roadmap.courses;
    roadmap.coverPath = imagePath || roadmap.coverPath;

    // Save the updated roadmap
    const updatedRoadmap = await roadmap.save();

    res.status(200).json({ message: 'Roadmap updated successfully', roadmap: updatedRoadmap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update roadmap', details: error });
  }
};


const getRoadmaps = async function (req, res) {
  try {
    const roadmaps = await Roadmap.find().select('-suggestions, -courses');
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPaginatedRoadmaps = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of roadmaps per page
    const filter = req.query.filter; // Filter keyword for roadmap title or description

    // Build the query object for filtering roadmaps
    const query = {};

    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for roadmap title
        { description: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for roadmap description
      ];
    }

    // Count the total number of roadmaps matching the filter
    const count = await Roadmap.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Validate the current page number
    if (page > totalPages) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Fetch the roadmaps with pagination
    const roadmaps = await Roadmap.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ roadmaps, totalPages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get roadmaps', details: err.message });
  }
};

const getRoadmapById = async function (req, res) {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate({
        path: 'courses.courseId',
        select: 'title description'
      })
      .select('-suggestions');
    if (roadmap) {
      res.json(roadmap);
    } else {
      res.status(404).json({ message: 'Roadmap not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const teacherGetRoadmapById = async function (req, res) {
  try {
    const roadmap = await Roadmap.findById(req.params.id)
      .populate({
        path: 'courses.courseId',
        select: 'title description'
      })
      .populate({
        path: 'suggestions.teacherId',
        select: 'firstName lastName profilePicture'
      });

    if (roadmap) {
      res.json(roadmap);
    } else {
      res.status(404).json({ message: 'Roadmap not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id;

    // Find the roadmap by ID
    const roadmap = await Roadmap.findOne({ _id: roadmapId });

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Delete the roadmap
    await roadmap.deleteOne({ _id: roadmapId });

    res.status(200).json({ message: 'Roadmap deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete roadmap', details: err.message });
  }
};


const addSuggestionToRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const teacherId = req.teacher._id;
    const { suggestion } = req.body;

    // Check if the roadmap exists
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Create a new suggestion object
    const newSuggestion = {
      teacherId,
      suggestion
    };

    // Add the suggestion to the roadmap's suggestions array
    roadmap.suggestions.push(newSuggestion);

    // Save the updated roadmap
    await roadmap.save();

    res.json({ success: true, message: 'Suggestion added to roadmap' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeSuggestionFromRoadmap = async (req, res) => {
  try {
    const roadmapId = req.params.id;
    const suggestionId = req.params.suggestion_id;
    const teacherId = req.teacher._id;

    // Check if the roadmap exists
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Find the suggestion in the roadmap
    const suggestion = roadmap.suggestions.find(
      (suggestion) => suggestion._id.toString() === suggestionId
    );

    // Check if the suggestion exists in the roadmap
    if (!suggestion) {
      return res.status(404).json({ error: 'Suggestion not found in roadmap' });
    }

    // Check if the teacher is the owner of the suggestion
    if (suggestion.teacherId.toString() !== teacherId.toString()) {
      return res.status(403).json({ error: 'You are not allowed to remove this suggestion' });
    }

    // Remove the suggestion from the roadmap's suggestions array
    roadmap.suggestions.pull(suggestion._id);

    // Save the updated roadmap
    await roadmap.save();

    res.json({ success: true, message: 'Suggestion removed from roadmap' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { createRoadmap, getRoadmaps, getPaginatedRoadmaps, getRoadmapById, teacherGetRoadmapById, addSuggestionToRoadmap, removeSuggestionFromRoadmap, deleteRoadmap, updateRoadmap };
