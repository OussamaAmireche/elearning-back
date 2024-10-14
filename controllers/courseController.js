const Course = require('../models/Course');
const Teacher = require('../models/teacher');
const Part = require('../models/part');
const Chapter = require('../models/chapter');
const Quizz = require('../models/Quizz');
const Project = require('../models/project');
const EnrolledCourse = require('../models/EnrolledCourse');
const TopicCompleted = require('../models/TopicCompleted');
const mongoose = require('mongoose');
const chapter = require('../models/chapter');
const jwt = require('jsonwebtoken');

//get all courses
async function getCourses(req, res) {
  let tag = [];
  if (req.query.hasOwnProperty('tag')) {
    if(Array.isArray(req.query.tag)){
      tag = [...tag, ...req.query.tag];
    } else {
      tag.push(req.query.tag);
    }
  }
  let level = [];
  if (req.query.hasOwnProperty('level')) {
    if(Array.isArray(req.query.level)){
      level = [...level, ...req.query.level];
    } else {
      level.push(req.query.level);
    }
  }
  let rating = 0;
  if (req.query.hasOwnProperty('rating')) {
    rating = Number(req.query.rating);
  }

  let orderBy = 'averageRating';
  if (req.query.hasOwnProperty('orderBy')) {
    orderBy = req.query.orderBy;
  }

  let ascending = 1;
  if (req.query.hasOwnProperty('ascending')) {
    ascending = Number(req.query.ascending);
  }

  let page = 0;
  if (req.query.hasOwnProperty('page')) {
    page = Number(req.query.page);
  }
  
    try {
      let query = Course.where({});

      if(tag.length !== 0){
        query = query.where('tags').in(tag);
      }

      if(level.length !== 0){
        query = query.where('level').in(level);
      }

      //if request has rating parameter we use it to filter courses
      if(rating === 0){
        const courses = await Course.aggregate([
          {
            $addFields: {
              averageRating: { $avg: '$ratings.rating' },
            },
          },
          {
            $match: query.getQuery()
          },
          {
            $lookup: {
              from: 'teachers', 
              localField: 'teacherId', 
              foreignField: '_id', 
              as: 'teacher',
              pipeline: [ 
                {
                  $project: {
                    _id: 0, 
                    firstName: 1,
                    lastName: 1,
                  }
                },
              ], 
            }
          },
          {
            $project: {
              title: 1,
              description: 1,
              level: 1,
              hourEstimation: 1,
              timeSpent: 1,
              coverPath: 1,
              educationalGoals: 1,
              prerequisites: 1,
              tags: 1,
              teacherId: 1,
              averageRating: 1,
              teacher: 1
            },
          },
          {
            $sort: { [orderBy]: ascending },
          },
          {
            $skip: 5 * page, // specify the number of documents to skip
          },
          {
            $limit: 5, // specify the number of documents to limit
          },
        ]);
        return res.json(courses);
      } else {
        const courses = await Course.aggregate([
          {
            $addFields: {
              averageRating: { $avg: '$ratings.rating' },
            },
          },
          {
            $match: {
              $and: [
                query.getQuery(),
                { averageRating: { $gte: rating } },
              ],
            },
          },
          {
            $lookup: {
              from: 'teachers', 
              localField: 'teacherId', 
              foreignField: '_id', 
              as: 'teacher', 
              pipeline: [ 
                {
                  $project: {
                    _id: 0, 
                    firstName: 1,
                    lastName: 1,
                  }
                },
              ],
            }
          },
          {
            $project: {
              title: 1,
              description: 1,
              level: 1,
              hourEstimation: 1,
              timeSpent: 1,
              coverPath: 1,
              educationalGoals: 1,
              prerequisites: 1,
              tags: 1,
              teacherId: 1,
              averageRating: 1,
              teacher: 1
            },
          },
          {
            $sort: { averageRating: ascending },
          },
          {
            $skip: 5 * page, // specify the number of documents to skip
          },
          {
            $limit: 5, // specify the number of documents to limit
          },
        ]);
        return res.json(courses);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

const getPaginatedCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of courses per page
    const filter = req.query.filter; // Filter keyword for course title or teacher name

    // Build the query object for filtering courses
    const query = {};

    if (filter) {
      query.$or = [
        { title: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for course title
        { tags: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for teacher name
      ];
    }

    // Count the total number of courses matching the filter
    const count = await Course.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Validate the current page number
    if (page > totalPages) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Fetch the courses with pagination and populate the teacher field
    const courses = await Course.find(query)
      .populate('teacherId', 'firstName lastName') // Populate the teacher field with firstName and lastName
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ courses, totalPages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get courses', details: err.message });
  }
};

const autocompleteCourses = async (req, res) => {
  try {
    const keyword = req.query.keyword; // Keyword for course search

    // Build the query object for autocomplete
    const query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' }; // Case-insensitive regex search for course title
    }

    // Fetch the matching courses
    const courses = await Course.find(query).limit(10); // Limit the results to 10 courses

    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch autocomplete results', details: err.message });
  }
};


//create a course

async function createCourse(req, res) {
    const { title, description, level, hourEstimation, imagePath } = req.body;
    const educationalGoals = req.body['educationalGoals[]'];
    const prerequisites = req.body['prerequisites[]'];
    const tags = req.body['tags[]'];
    try {
        const newCourse = new Course({title, description, level, hourEstimation, coverPath : imagePath, educationalGoals, prerequisites, tags});
        newCourse.teacherId = req.teacher._id;
        await newCourse.save();
        return res.status(201).json({ message: 'Course created successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creating course' });
    }
}

async function updateCourse(req, res) {
  const courseId = req.params.id;
  const { title, description, level, hourEstimation, imagePath } = req.body;

  const educationalGoals = req.body['educationalGoals[]'];
  const prerequisites = req.body['prerequisites[]'];
  const tags = req.body['tags[]'];
  
  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if the teacher is the owner of the course
    if (course.teacherId.toString() !== req.teacher._id.toString()) {
      return res.status(403).json({ error: 'You are not allowed to update this course' });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.level = level || course.level;
    course.hourEstimation = hourEstimation || course.hourEstimation;
    course.coverPath = imagePath || course.coverPath;
    course.educationalGoals = educationalGoals || course.educationalGoals;
    course.prerequisites = prerequisites || course.prerequisites;
    course.tags = tags || course.tags;

    await course.save();

    return res.json({ message: 'Course updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating course' });
  }
}


//add a rating to a course
async function addRating(req, res) {
  const id = req.params.id; // Access route parameter for course ID
  const studentId = req.student._id; // Access route parameter for course ID
  const { comment, rating } = req.body; // Access request body for rating details

  try {
    // Find the course by ID
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if studentId already exists in ratings array
    const existingRating = await Course.find({"ratings.studentId" : studentId, _id: id});

    if (existingRating.length > 0) {
      return res.status(400).json({ error: 'Rating already exists for student' });
    }

    // Create a new rating object
    const newRating = {
      studentId,
      comment,
      rating
    };

    // Add the rating to the course's ratings array
    course.ratings.push(newRating);

    // Save the updated course object
    await course.save();

    return res.status(200).json({ message: 'Rating added successfully', rating: newRating });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add rating' });
  }
};

//remove a rating from the course
const removeRating = async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.student._id;

  try {
    const course = await Course.findById(courseId);
    const ratingIndex = course.ratings.findIndex((rating) => rating.studentId.toString() === studentId.toString());

    if (ratingIndex === -1) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    course.ratings.splice(ratingIndex, 1);
    await course.save();

    return res.status(200).json({ message: 'Rating removed successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to remove rating' });
  }
};


//fetch course with teacher information
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId)
      .populate({
        path: 'teacherId',
        select: '-password -email -createdAt -updatedAt',
      })
      .populate({
        path: 'ratings.studentId',
        select: '-password -email -createdAt -updatedAt',
      });

    return res.status(200).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getCourseSummary = async (req, res) => {
  try {
    const courseId = req.params.id;
    let studentId;

    if(req.headers.authorization){
      const authHeader = req.headers.authorization;
      const token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      studentId = decoded.studentId;
    }

    const parts = await Part.find({ courseId: courseId }).select('-courseId -createdAt -updatedAt').lean();

    for (const part of parts) {
      let chapters = await Chapter.find({ partId: part._id }).select('-partId -createdAt -updatedAt').lean();
      part.chapters = chapters;
      if (studentId) {
          for (const chapter of chapters) {
          const chapterFound = await TopicCompleted.findOne({ topicId: chapter._id, topicType: 'Chapter', studentId: studentId });
          if (chapterFound) {
            chapter.completed = true;
          } else {
            chapter.completed = false;
          }
        }
      }
      const quizz = await Quizz.findOne({ partId: part._id }).select('-partId -createdAt -updatedAt').lean();
      if(quizz){
        part.quizz = quizz;
        if(studentId){
          const quizzFound = await TopicCompleted.findOne({ topicId: quizz._id, topicType: 'Quizz', studentId: studentId });
          if (quizzFound) {
            quizz.completed = true;
          } else {
            quizz.completed = false;
          }
        }
      }
    }
    const project = await Project.findOne({ courseId: courseId }).select('-courseId -createdAt -updatedAt').lean();
    if (project) {
      if(studentId){
        const projectFound = await TopicCompleted.findOne({ topicId: project._id, topicType: 'Project', studentId: studentId });
          if (projectFound) {
            project.completed = true;
          } else {
            project.completed = false;
          }
      }
    }

    res.status(200).json({ parts, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const enrollCourse = async (req, res) => {
  const studentId = req.student._id;
  const courseId = req.params.id;

  try {
      // Check if the student is already enrolled in the course
      const enrolledCourse = await EnrolledCourse.findOne({ studentId, courseId });
      if (enrolledCourse) {
      return res.status(400).json({ error: 'You have already enrolled in this course' });
      }

      // Enroll the student in the course
      const newEnrolledCourse = new EnrolledCourse({ studentId, courseId });
      await newEnrolledCourse.save();

      res.json({ message: 'Enrolled successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to enroll', details: err });
  }
};

const unsubscribeCourse = async (req, res) => {
  const studentId = req.student._id;
  const courseId = req.params.id;

  try {
      // Check if the student is enrolled in the course
      const enrolledCourse = await EnrolledCourse.findOne({ studentId, courseId });
      if (!enrolledCourse) {
      return res.status(404).json({ error: 'You are not enrolled in this course' });
      }

      // Unsubscribe the student from the course
      await EnrolledCourse.findByIdAndDelete(enrolledCourse._id);

      res.json({ message: 'Unsubscribed successfully' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to unsubscribe', details: err });
  }
};

async function getEnrolledCoursesWithCompletionRate(req, res) {
  try {
    const enrolledCourses = await EnrolledCourse.find({ studentId: req.student._id }).populate('courseId');
    const coursesWithCompletionRate = await Promise.all(enrolledCourses.map(async (enrolledCourse) => {
      const course = enrolledCourse.courseId;

      const parts = await Part.find({ courseId: course._id }).select('_id');
      const partIds = parts.map(part => part._id);

      const chapters = await Chapter.find({ partId: { $in: partIds } });
      const quizzes = await Quizz.find({ partId: { $in: partIds } });
      const projects = await Project.find({ courseId: course._id });

      const total = chapters.length + quizzes.length + projects.length;
      const completedChapters = await TopicCompleted.countDocuments({ studentId: req.student.id, topicId: { $in: chapters.map(chapter => chapter._id) }, topicType: 'Chapter' });
      const completedQuizzes = await TopicCompleted.countDocuments({ studentId: req.student.id, topicId: { $in: quizzes.map(quizz => quizz._id) }, topicType: 'Quizz' });
      const completedProjects = await TopicCompleted.countDocuments({ studentId: req.student.id, topicId: { $in: projects.map(project => project._id) }, topicType: 'Project' });
      const completed = completedChapters + completedQuizzes + completedProjects;

      const completionRate = (completed / total) * 100;
      const courseWithCompletionRate = course.toObject();
      courseWithCompletionRate.completionRate = completionRate;

      return courseWithCompletionRate;
    }));

    res.status(200).json(coursesWithCompletionRate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getEnrolledCourses(req, res) {
  try {
    const enrolledCourses = await EnrolledCourse.find({ studentId: req.student._id }).populate('courseId', 'title');
    
    const coursesInfo = enrolledCourses.map((enrolledCourse) => {
      const courseId = enrolledCourse.courseId._id;
      const courseTitle = enrolledCourse.courseId.title;
      return { id: courseId, title: courseTitle };
    });

    res.status(200).json(coursesInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

const getMyCourses = async (req, res) => {
  try {
    const teacherId = req.teacher._id;

    // Find courses by teacherId
    const courses = await Course.find({ teacherId }).populate('ratings.studentId');

    // Calculate average rating for each course
    const coursesWithAvgRating = courses.map(course => {
      const ratings = course.ratings.map(rating => rating.rating);
      const avgRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating) / ratings.length : 0;
      
      return {
        ...course._doc,
        averageRating: avgRating
      };
    });

    res.json(coursesWithAvgRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const deleteCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if(req.teacher){
      // Check if the teacher ID matches
      if (course.teacherId.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to delete this course' });
      }
    } else {
      return res.status(403).json({ error: 'You are not allowed to delete this course' });
    }

    // Delete the course
    await Course.deleteOne({ _id: courseId });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

const deleteCourseByAdmin = async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find the course by ID
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete the course
    await Course.deleteOne({ _id: courseId });

    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete course', details: err.message });
  }
};

module.exports = { 
  getCourses,
  createCourse, 
  addRating, 
  removeRating, 
  getCourse, 
  getCourseSummary,
  enrollCourse,
  unsubscribeCourse,
  getEnrolledCoursesWithCompletionRate,
  getEnrolledCourses,
  updateCourse,
  getMyCourses,
  deleteCourseById,
  getPaginatedCourses,
  deleteCourseByAdmin, 
  autocompleteCourses
};