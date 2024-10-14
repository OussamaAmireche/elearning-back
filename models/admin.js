const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
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
    role: {
        type: String,
        enum: ['Admin', 'Super Admin'],
        required: true
    }
}, {timestamps:true});

module.exports = mongoose.model('Admin', adminSchema);