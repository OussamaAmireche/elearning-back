const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    firstName : {
        type: String,
        required: true,
    },
    lastName : {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique : true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    birthDate: {
        type: Date,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique : true,
    },
    accountStatus: {
        type: String,
        enum: ['active', 'unactive'],
        default: 'unactive'
    },
    profilePicture: String,
    description: String,
    diplomasPath: {
        type: String,
        required: true
    }
}, {timestamps:true});

module.exports = mongoose.model('Teacher', teacherSchema);