const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chapterSchema = new Schema({
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
    order: {
        type: Number,
        required: true
    },
    partId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Part',
        required: true
    }
}, {timestamps: true})

    chapterSchema.index({ order: 1, partId: 1 }, { unique: true });

module.exports = mongoose.model('Chapter' , chapterSchema);