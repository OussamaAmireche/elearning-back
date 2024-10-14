const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    comment: { 
        type: String,
    },
    rating: {
        type: Number,
        required: true
    }
  });

const courseSchema = new Schema({
    title : {
        type: String,
        required: true
    },
    description : {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Easy', 'Intermediate', 'Advanced'],
        required: true
    },
    hourEstimation: {
        type: Number,
        required: true
    },
    coverPath: {
        type: String,
        required: true
    },
    educationalGoals: [{
        type: String,
        required: true
    }],
    prerequisites: [{
        type: String,
    }],
    tags: [{
        type: String
    }],
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    ratings: [ratingSchema]
}, {timestamps: true})
module.exports = mongoose.model('Course' , courseSchema);