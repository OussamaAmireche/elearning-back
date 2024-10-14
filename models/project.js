const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectUploadSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    file: {
        type: String,
        required: true
    }
  });

const projectSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    videoPath: {
        type: String,
        required: true
    },
    notices: [{
        type: String,
    }],
    files: [{
        type: String,
    }],
    projectUploaded: [projectUploadSchema],
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {timestamps: true})
module.exports = mongoose.model('Project' , projectSchema);