const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicCompletedSchema = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    topicId: { 
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'topicType',
        required: true
    },
    topicType: {
        type: String,
        required: true,
        enum: ['Chapter', 'Quizz', 'Project']
    }
}, {timestamps: true})

    topicCompletedSchema.index({ studentId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('TopicCompleted' , topicCompletedSchema);