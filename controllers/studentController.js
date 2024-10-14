const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET;

// Signup function
async function signup(req, res) {
    const { firstName, lastName, email, password, birthDate, phoneNumber, imagePath } = req.body;

    console.log(imagePath);
    try {
        // Check if the email is already registered
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
        return res.status(409).json({ message: 'Email already registered' });
        }

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new student in the database
        const newStudent = new Student({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        birthDate,
        phoneNumber,
        profilePicture : imagePath
        });

        await newStudent.save();

        // Generate a JWT token
        const token = jwt.sign(
        { email: newStudent.email, studentId: newStudent._id },
        secretKey,
        { expiresIn: '7d' } 
        );

        // Return success response with token
        return res.status(201).json({ message: 'Signup successful', token, student: newStudent });
    } catch (error) {
        console.error('Error in signup:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Login function
async function login(req, res) {
    const { email, password } = req.body;

    try {
        // Check if the email is registered
        const existingStudent = await Student.findOne({ email });
        if (!existingStudent) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(password, existingStudent.password);
        if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate a JWT token
        const token = jwt.sign(
        { email: existingStudent.email, studentId: existingStudent._id },
        secretKey, 
        { expiresIn: '7d' } 
        );

        // Return success response with token
        return res.status(200).json({ message: 'Login successful', token, student: existingStudent });
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Get a single student by ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        // Omit the password field from the response
        const { password: omitPassword, ...studentData } = student._doc;
        res.status(200).json({ success: true, data: studentData });
    } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    }
};

// Get My Profile usinf token
const getMyProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.student._id);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Student not found' });
        }
        // Omit the password field from the response
        const { password: omitPassword, ...studentData } = student._doc;
        res.status(200).json({ success: true, data: studentData });
    } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    }
};

// Update Student
const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { firstName, lastName, email, birthDate, phoneNumber, imagePath } = req.body;

        if(studentId !== req.student._id.toString()){
            return res.status(403).json({ error: 'You are not allowed to update this student' });
        }
    
        // Find the student by ID
        const student = await Student.findOne({ _id: studentId });
    
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
    
        // Update the student fields
        student.firstName = firstName || student.firstName;
        student.lastName = lastName || student.lastName;
        student.email = email || student.email;
        student.birthDate = birthDate || student.birthDate;
        student.phoneNumber = phoneNumber || student.phoneNumber;
        student.profilePicture = imagePath || student.profilePicture;
    
        // Save the updated student
        await student.save();
    
        // Return the updated student data
        const { password, ...studentData } = student._doc;
        return res.json({ student: studentData });
    } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update student' });
    }
};

const sendResetPasswordEmail = async (req, res) => {
  try {
    // Check if email exists
    const { email } = req.body;
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(resetToken, salt);
    student.resetPasswordToken = hash;
    student.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await student.save();

    // Send reset password email
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Password Reset',
      text: `Please click the following link to reset your password: ${process.env.CLIENT_URL}/student/reset-password?token=${hash}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return res.status(500).json({ message: 'Error sending email' });
      } else {
        return res.status(200).json({ message: 'Email sent' });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {

  const resetPasswordToken = req.query.token;
  const { newPassword } = req.body;

  try {
    // Find the student by their reset token
    const student = await Student.findOne({ resetPasswordToken: resetPasswordToken });
    
    if (!student) {
      return res.status(404).json({ message: 'Invalid or expired reset token' });
    }

    // Check if the reset token has expired
    if (student.resetTokenExpiration < new Date()) {
      return res.status(404).json({ message: 'Invalid or expired reset token' });
    }

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the student's password and reset token
    student.password = hashedPassword;
    student.resetPasswordToken = null;
    student.resetPasswordExpires = null;
    await student.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of students per page
    const filter = req.query.filter; // Filter keyword for first name or last name

    // Build the query object for filtering
    const query = {};
    if (filter) {
      query.$or = [
        { firstName: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for first name
        { lastName: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for last name
      ];
    }

    // Count the total number of students matching the filter
    const count = await Student.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Validate the current page number
    if (page > totalPages) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Fetch the students with pagination and filter
    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ students, totalPages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get students', details: err.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Find the student by ID
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete the student
    await Student.deleteOne({ _id: studentId });

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete student', details: err.message });
  }
};

module.exports = { signup, 
                    login, 
                    getStudentById, 
                    updateStudent, 
                    getMyProfile, 
                    sendResetPasswordEmail,
                    resetPassword,
                    getStudents,
                    deleteStudent
                };