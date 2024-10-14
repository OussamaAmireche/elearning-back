const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const mongoose = require('mongoose');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const globalRoutes = require('./routes/globalRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const quizzRoutes = require('./routes/quizzRoutes');
const partRoutes = require('./routes/partRoutes');
const projectRoutes = require('./routes/projectRoutes');
const forumRoutes = require('./routes/forumRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
require('dotenv').config();

//DB connection
const dbUrl = process.env.DATABASE_URL;
mongoose.set({strictQuery : true});
mongoose.connect(dbUrl , {useNewUrlParser: true , useUnifiedTopology: true}).then(() => app.listen(3003));

console.log('listening on port 3003...');

// Function to serve all static files
// inside public directory.
app.use(express.static('uploads'));
app.use('/uploads/images', express.static('images'));
app.use('/uploads/videos', express.static('videos'));
app.use('/uploads/documents', express.static('documents'));
app.use(express.json());
app.use(fileUpload());
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
});

// Function to serve all static files
// inside public directory.
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
  
app.use('', globalRoutes);
app.use('/course', courseRoutes);
app.use('/course/:course_id/part', partRoutes);
app.use('/course/:course_id/project', projectRoutes);
app.use('/course/:course_id/forum', forumRoutes);
app.use('/course/:course_id/part/:part_id/chapter', chapterRoutes);
app.use('/course/:course_id/part/:part_id/quizz', quizzRoutes);
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
app.use('/podcast', podcastRoutes);
app.use('/roadmap', roadmapRoutes);
mongoose.set({strictQuery : true});