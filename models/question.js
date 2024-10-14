const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const responseSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'authorType',
        required: true
    },
    authorType: {
        type: String,
        required: true,
        enum: ['Student', 'Teacher']
    },
    body: {
        type: String,
        required: true
    },
    files: [{
        type: String
    }]
  });

const forumQuestionSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    body : {
        type: String,
        required: true
    },
    files: [{
        type: String
    }],
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    responses: [responseSchema]
    
}, {timestamps: true})
module.exports = mongoose.model('ForumQuestion' , forumQuestionSchema);