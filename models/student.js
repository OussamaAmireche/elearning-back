const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
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
        unique : true,
    },
    profilePicture: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
}, {timestamps:true});

module.exports = mongoose.model('Student', studentSchema);