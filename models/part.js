const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const partSchema = new Schema({
    title : {
        type: String,
        required: true,
    },
    order : {
        type: Number,
        required: true,
        unique: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }],
    quizz: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quizz' 
    }
}, {timestamps:true});

module.exports = mongoose.model('Part', partSchema);