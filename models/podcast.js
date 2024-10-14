const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    studentId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    comment: { 
        type: String,
        required: true
    }
  });

const podcastSchema = new Schema({
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
    videoPath: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    reactions: {
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
        }],
        comments: [commentSchema]
    }
}, {timestamps: true})
module.exports = mongoose.model('Podcast' , podcastSchema);