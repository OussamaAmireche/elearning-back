const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enrolledCourseSchema = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, {timestamps: true})

    enrolledCourseSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('EnrolledCourse' , enrolledCourseSchema);