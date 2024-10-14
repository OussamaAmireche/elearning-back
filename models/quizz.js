const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizzResponseSchema = new mongoose.Schema({
    status: { 
        type: Boolean,
        required: true
    },
    body: {
        type: String,
        required: true
    }
  });

const quizzQuestionSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    responses: [quizzResponseSchema]
  });

const quizzSchema = new Schema({
    partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Part',
        required: true
    },
    questions: [quizzQuestionSchema]
}, {timestamps: true})
module.exports = mongoose.model('Quizz' , quizzSchema);