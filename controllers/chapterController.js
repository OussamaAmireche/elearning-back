const Part = require('../models/part');
const Chapter = require('../models/chapter'); 
const TopicCompleted = require('../models/TopicCompleted'); 
const EnrolledCourse = require('../models/EnrolledCourse'); 
const jwt = require('jsonwebtoken');

// Controller method to create a new Chapter document
const createChapter = async (req, res) => {
    const courseId = req.params.course_id;
    const partId = req.params.part_id;
    const { title, description, videoPath, files, order } = req.body;

    const notices = req.body['notices[]'];

    try {
        // Check if the partId provided exists in the Part collection
        const part = await Part.findById(partId);
        if (!part) {
            return res.status(404).json({ error: 'Part not found' });
        }
        if (part.courseId.toString() !== courseId){
            return res.status(404).json({ error: 'Course not found' });
        }

        // Create a new Chapter document
        const chapter = new Chapter({
            title,
            description,
            videoPath,
            notices,
            files,
            order,
            partId
        });

        const result = await chapter.save();
        part.chapters.push(result._id);
        const savedPart = await part.save();

        res.status(201).json({ message: 'Chapter created successfully', chapter: result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create Chapter', details: err });
    }
};


// Controller method to update an existing Chapter document by ID
const updateChapter = async (req, res) => {
    const chapterId = req.params.id; // Get the chapter ID from request parameters
    const { title, description, videoPath, files, order} = req.body;
    const notices = req.body['notices[]'];

    try {
        const chapter = await Chapter.findById(chapterId).exec();
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        chapter.title = title;
        chapter.description = description;
        if(videoPath){
            chapter.videoPath = videoPath;
        }
        if(files){
            chapter.files = files;
        }
        chapter.notices = notices;
        chapter.order = order;

        const result = await chapter.save();

        res.status(200).json({ message: 'Chapter updated successfully', chapter: result });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update Chapter', details: err });
    }
};

// Controller method to get a Chapter document by ID
const getChapterById = async (req, res) => {
    const chapterId = req.params.id; // Get the chapter ID from request parameters
    let studentId;

    if(req.headers.authorization){
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      studentId = decoded.studentId;
    }

    try {
        const chapter = await Chapter.findOne({ _id: chapterId}).lean();
        if (!chapter) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        if(studentId){
            const completed = await TopicCompleted.findOne({ topicId: chapter._id, topicType: 'Chapter', studentId: studentId });
            if(completed){
                chapter.completed = true;
            } else {
                chapter.completed = false;
            }
        }

        res.status(200).json({ chapter });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get Chapter', details: err });
    }
};

// Controller method to delete a Chapter document by ID
const deleteChapter = async (req, res) => {
    try {
        const chapterId = req.params.id;

        // Find the chapter by ID
        const chapter = await Chapter.findById(chapterId);

        if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
        }

        // Delete the chapter
        await Chapter.deleteOne({ _id: chapterId });

        res.json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete chapter' });
    }
};


// Mark a chapter as completed
const markChapterAsCompleted = async (req, res) => {
    const studentId = req.student._id;
    const courseId = req.params.course_id;
    const chapterId = req.params.id;

    try {

        // Check if student already enrolled this course
        courseEnrolled = await EnrolledCourse.findOne({ courseId: courseId, studentId: studentId });
        console.log(courseEnrolled);
        if (!courseEnrolled) {
            return res.status(400).json({ error: 'You didn\'t Enroll this course yet' });
        }

        const chapter = await Chapter.findById(chapterId);

        if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
        }

        // Check if student already completed this chapter
        chapterCompleted = await TopicCompleted.findOne({ topicId: chapter._id, topicType: 'Chapter', studentId: studentId });
        if (chapterCompleted) {
            return res.status(409).json({ error: 'You already marked this chapter as completed' });
        }

        // Create a new topicCompleted document
        const topicCompleted = new TopicCompleted({
        studentId: studentId,
        topicId: chapterId,
        topicType: 'Chapter'
        });

        await topicCompleted.save();

        res.json({ message: 'Chapter marked as completed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark chapter as completed', details: err });
    }
};

    // Mark a chapter as not completed
const markChapterAsNotCompleted = async (req, res) => {
    const studentId = req.student._id;
    const chapterId = req.params.id;
    
    try {
        const chapter = await Chapter.findById(chapterId);
    
        if (!chapter) {
        return res.status(404).json({ error: 'Chapter not found' });
        }
    
        // Check if the chapter has been marked as completed before
        const topicCompleted = await TopicCompleted.findOne({ studentId, topicId: chapterId, topicType: 'Chapter' });
    
        if (!topicCompleted) {
        return res.status(400).json({ error: 'Chapter has not been marked as completed' });
        }
    
        // Delete the corresponding topicCompleted document
        await TopicCompleted.findOneAndDelete({ studentId, topicId: chapterId, topicType: 'Chapter' });
    
        res.json({ message: 'Chapter marked as not completed' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark chapter as not completed', details: err });
    }
};


module.exports = {
    createChapter,
    updateChapter,
    getChapterById,
    deleteChapter,
    markChapterAsCompleted,
    markChapterAsNotCompleted
};
