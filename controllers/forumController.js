const ForumQuestion = require('../models/Question');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/teacher');

// Ask a question
const askQuestion = async (req, res) => {
  try {
    const courseId = req.params.course_id;
    const studentId = req.student._id;
    const { title, body, files } = req.body;

    //Check if course exist
    const course = await Course.findById(courseId);
    if(!course){
      return res.status(404).json({ message: 'Course Not Found' });
    }

    //Check if student exist
    const student = await Student.findById(studentId);
    if(!student){
      return res.status(404).json({ message: 'Student Not Found' });
    }

    const question = new ForumQuestion({ title, body, files, courseId, studentId });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a question by id
const getQuestionById = async (req, res) => {
  try {
    if(req.teacher){
      const course = await Course.findById(req.params.course_id);
      if(req.teacher._id.toString() !== course.teacherId.toString()){
        return res.status(403).json({ message: 'You are not authorized to access these questions' });
      }
    }
    const question = await ForumQuestion.findById(req.params.id)
    .populate('studentId', 'firstName lastName') // Populate the student field with firstName and lastName
    .populate('responses.userId', 'firstName lastName'); // Populate the student field with firstName and lastName
    
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Answer a question
const answerQuestion = async (req, res) => {
  try {
    let userId = '';
    if(req.student){
      userId = req.student._id;
    }else if(req.teacher){
      userId = req.teacher._id;
      const course = await Course.findById(req.params.course_id);
      if(req.teacher._id.toString() !== course.teacherId.toString()){
        return res.status(403).json({ message: 'You are not authorized to respond to this question' });
      }
    }
    const { authorType, body, files } = req.body;
    if(authorType === 'Student'){
        //Check if the user id is really a student
        const student = await Student.findById(userId);
        if(!student){
        return res.status(404).json({ message: 'Student Not Found' });
        }
    }else if(authorType === 'Teacher'){
        //Check if the user id is really a teacher
        const teacher = await Teacher.findById(userId);
        if(!teacher){
        return res.status(404).json({ message: 'Teacher Not Found' });
        }
    }else{
        return res.status(422).json({ message: 'AuthorType Is Not Correct' });
    }
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.responses.push({ userId, authorType, body, files });
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search for a question using a word in the title
const searchQuestions = async (req, res) => {
  try {
    const { search } = req.query;
    const questions = await ForumQuestion.find({ title: { $regex: search, $options: 'i' } });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all questions of a specific course
const getQuestionsByCourse = async (req, res) => {
  try {
    if(req.teacher){
      const course = await Course.findById(req.params.course_id);
      if(req.teacher._id.toString() !== course.teacherId.toString()){
        return res.status(403).json({ message: 'You are not authorized to access these questions' });
      }
    }
    if (req.query.hasOwnProperty('term')) {
        const questions = await ForumQuestion.find({
            title: { $regex: req.query.term, $options: 'i' },
            courseId: req.params.course_id
        });
        res.json(questions);
    }else{
        const questions = await ForumQuestion.find({ courseId: req.params.course_id });
        res.json(questions);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    if(req.student){
      if(question.studentId.toString() !== req.student._id.toString()){
        return res.status(403).json({ message: 'You are not authorized to delete this question' });
      }
    }else if(req.teacher){
      const course = await Course.findById(question.courseId);
      if(course.teacherId.toString() !== req.teacher._id.toString()){
        return res.status(403).json({ message: 'You are not authorized to delete this question' });
      }
    }
    await ForumQuestion.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an answer
const deleteAnswer = async (req, res) => {
  try {
    const question = await ForumQuestion.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const response = question.responses.id(req.params.response_id);
    if (!response) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    if(req.student){
      if(response.userId.toString() !== req.student._id.toString()){
        return res.status(403).json({ message: 'You are not authorized to delete this answer' });
      }
    }else if(req.teacher){
      const course = await Course.findById(question.courseId);
      if(course.teacherId.toString() !== req.teacher._id.toString()){
        return res.status(403).json({ message: 'You are not authorized to delete this answer' });
      }
    }
    const responseIndex = question.responses.findIndex(resp => resp._id.equals(req.params.response_id));
    if (responseIndex === -1) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    question.responses.splice(responseIndex, 1);
    await question.save();
    res.json({ message: 'Answer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  askQuestion,
  getQuestionById,
  answerQuestion,
  searchQuestions,
  getQuestionsByCourse,
  deleteQuestion,
  deleteAnswer
};
