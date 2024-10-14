const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roadmapCourseSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    order: {
        type: Number,
        required: true
    }
});

const SuggestionSchema = new mongoose.Schema({
    teacherId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    suggestion: {
        type: String,
        required: true
    }
});

const roadmapSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    coverPath: {
        type: String,
        required: true
    },
    courses: [roadmapCourseSchema],
    suggestions: [SuggestionSchema] 
    
}, {timestamps: true})
module.exports = mongoose.model('Roadmap' , roadmapSchema);