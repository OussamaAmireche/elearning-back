const Quizz = require('../models/Quizz'); 
const Part = require('../models/part'); 
const TopicCompleted = require('../models/TopicCompleted'); 

const createQuizz = async function (req, res) {
  try {

    const partId = req.params.part_id;
    const courseId = req.params.course_id;
    const { questions } = req.body;

    // Check if the partId provided exists in the Part collection
    const part = await Part.findById(partId);
    if (!part) {
        return res.status(404).json({ error: 'Part not found' });
    }
    if (part.courseId.toString() !== courseId){
        return res.status(404).json({ error: 'Course not found' });
    }

    // Check if a quizz already exists for this part
    const existingQuizz = await Quizz.findOne({ partId });
    if (existingQuizz) {
      return res.status(400).json({ message: 'A quizz already exists for this part' });
    }

    const quizz = new Quizz({
      partId,
      questions
    });
    const createdQuizz = await quizz.save();
    part.quizz = createdQuizz._id;
    savedPart = await part.save();
    res.status(201).json(createdQuizz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateQuizz = async function (req, res) {
  try {
    const quizzId = req.params.id;
    const { questions } = req.body;
    console.log(req.body);
    const quizz = await Quizz.findById(quizzId);
    if (!quizz) {
      return res.status(404).json({ error: 'Quizz not found' });
  }
  quizz.questions = questions;
  const updatedQuizz = await quizz.save();
    res.json(updatedQuizz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getQuizzById = async function (req, res) {
  try {
    const quizzId = req.params.id;
    const quizz = await Quizz.findById(quizzId).select('-questions.responses.status');
    if (quizz) {
      res.json(quizz);
    } else {
      res.status(404).json({ message: 'Quizz not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteQuizz = async function (req, res) {
  try {
    const quizzId = req.params.id;
    const deletedQuizz = await Quizz.findByIdAndDelete(quizzId);
    if (deletedQuizz) {
      res.json({ message: 'Quizz deleted successfully' });
    } else {
      res.status(404).json({ message: 'Quizz not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const evaluateQuizz = async function (req, res) {
  try {
    const studentId = req.student._id;
    const quizzId = req.params.id;
    const studentResponses = req.body.studentResponses;

    const quizz = await Quizz.findById(quizzId);
    if (!quizz) {
      return res.status(404).json({ message: 'Quizz not found' });
    }

    const evaluatedResponses = quizz.questions.map((question) => {
      const { _id, responses: questionResponses } = question;
      const studentQuestionResponse = studentResponses.find((response) => response.questionId === _id.toString());
      if (!studentQuestionResponse) {
        return { questionId: _id, result: 0 };
      }

      const { answerIds } = studentQuestionResponse;
      const correctAnswerIds = questionResponses.filter((response) => response.status).map((response) => response._id.toString());
      if(answerIds.length !== correctAnswerIds.length){
        return { questionId: _id, result: 0 };
      }
      const isAnswerCorrect = correctAnswerIds.every((id) => answerIds.includes(id));
      return { questionId: _id, result: isAnswerCorrect ? 1 : 0 };
    });

    const totalQuestions = quizz.questions.length;
    const totalCorrectAnswers = evaluatedResponses.filter((response) => response.result === 1).length;
    const score = (totalCorrectAnswers / totalQuestions) * 100;

    if(score >= 40){
      // Create a new topicCompleted document
      const topicCompleted = new TopicCompleted({
        studentId: studentId,
        topicId: quizzId,
        topicType: 'Quizz'
      });

      await topicCompleted.save();

      res.status(201).json({ message: 'You have succeeded in this quizz' });
    }else{
      res.status(200).json({ message: 'You have not succeeded in this quizz' });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markQuizzAsNotCompleted = async (req, res) => {
  const studentId = req.student._id;
  const quizzId = req.params.id;

  try {
    const quizz = await Quizz.findById(quizzId);

    if (!quizz) {
      return res.status(404).json({ error: 'Quizz not found' });
    }

    // Check if the quizz has been marked as completed before
    const topicCompleted = await TopicCompleted.findOne({ studentId, topicId: quizzId, topicType: 'Quizz' });

    if (!topicCompleted) {
      return res.status(400).json({ error: 'Quizz has not been marked as completed' });
    }

    // Delete the corresponding topicCompleted document
    await TopicCompleted.findOneAndDelete({ studentId, topicId: quizzId, topicType: 'Quizz' });

    res.json({ message: 'Quizz marked as not completed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark quizz as not completed', details: err });
  }
};


module.exports = {
  createQuizz,
  updateQuizz,
  getQuizzById,
  deleteQuizz,
  evaluateQuizz,
  markQuizzAsNotCompleted
};
