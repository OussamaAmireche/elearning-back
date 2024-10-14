const Teacher = require('../models/teacher');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;

// Signup method for Teacher
async function signup(req, res) {
    try {
        const { firstName, lastName, email, password, birthDate, phoneNumber, imagePath, description, filePath } = req.body;

        // Check if email already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new Teacher instance
        const newTeacher = new Teacher({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            birthDate,
            phoneNumber,
            profilePicture: imagePath,
            description,
            diplomasPath: filePath
        });

        // Save the new Teacher to the database
        const savedTeacher = await newTeacher.save();

        // Generate JWT token
        const token = jwt.sign({ email: savedTeacher.email, teacherId: savedTeacher._id }, secretKey, { expiresIn: '7d' });

        // Return success response with token and teacher data
        return res.status(201).json({ token, teacher: savedTeacher });
    } catch (error) {
        // Handle error
        return res.status(500).json({ message: 'Server error' });
    }
};

// Login method for Teacher
async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Find Teacher by email
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isPasswordMatch = await bcrypt.compare(password, teacher.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ email: teacher.email, teacherId: teacher._id }, secretKey, { expiresIn: '7d' });

        // Return success response with token and teacher data
        return res.status(200).json({ token, teacher });
    } catch (error) {
        // Handle error
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get a single teacher by ID
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ success: false, error: 'Teacher not found' });
        }
        // Omit the password field from the response
        const { password: omitPassword, ...teacherData } = teacher._doc;
        res.status(200).json({ success: true, data: teacherData });
    } catch (err) {
    res.status(500).json({ success: false, error: err.message });
    }
    };

    const getMyProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.teacher._id).select('-password -diplomasPath');
        if (!teacher) {
        return res.status(404).json({ success: false, error: 'Teacher not found' });
        }
        res.status(200).json({ success: true, data: teacher });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { firstName, lastName, email, birthDate, phoneNumber, imagePath, filePath } = req.body;

        if (teacherId !== req.teacher._id.toString()) {
        return res.status(403).json({ error: 'You are not allowed to update this teacher' });
        }

        // Find the teacher by ID
        const teacher = await Teacher.findOne({ _id: teacherId });

        if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
        }

        // Update the teacher fields
        teacher.firstName = firstName || teacher.firstName;
        teacher.lastName = lastName || teacher.lastName;
        teacher.email = email || teacher.email;
        teacher.birthDate = birthDate || teacher.birthDate;
        teacher.phoneNumber = phoneNumber || teacher.phoneNumber;
        teacher.profilePicture = imagePath || teacher.profilePicture;
        teacher.diplomasPath = filePath || teacher.diplomasPath;

        // Save the updated teacher
        await teacher.save();

        // Return the updated teacher data
        const { password, ...teacherData } = teacher._doc;
        return res.json({ teacher: teacherData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to update teacher' });
    }
};

const deleteTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;

        // Find the teacher by ID
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
        }

        // Delete the teacher
        await Teacher.deleteOne({ _id: teacherId });

        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete teacher', details: err.message });
    }
};

const getTeachers = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = parseInt(req.query.limit) || 10; // Number of teachers per page
      const filter = req.query.filter; // Filter keyword for first name or last name

        // Build the query object for filtering
        const query = {};
        if (filter) {
        query.$or = [
            { firstName: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for first name
            { lastName: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for last name
        ];
        }

        // Count the total number of teachers matching the filter
        const count = await Teacher.countDocuments(query);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / limit);

        // Validate the current page number
        if (page > totalPages) {
        return res.status(400).json({ message: 'Invalid page number' });
        }

        // Fetch the teachers with pagination and filter
        const teachers = await Teacher.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

        res.status(200).json({ teachers, totalPages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get teachers', details: err.message });
    }
};

const getUnactiveTeachers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number
        const limit = parseInt(req.query.limit) || 10; // Number of teachers per page
        const filter = req.query.filter; // Filter keyword for first name or last name

        // Build the query object for filtering
        const query = { accountStatus: 'unactive' };

        if (filter) {
        query.$or = [
            { firstName: { $regex: filter, $options: 'i' } },
            { lastName: { $regex: filter, $options: 'i' } },
        ];
        }

        // Count the total number of teachers matching the filter
        const count = await Teacher.countDocuments(query);

        // Calculate the total number of pages
        const totalPages = Math.ceil(count / limit);

        // Validate the current page number
        if (page > totalPages) {
        return res.status(400).json({ message: 'Invalid page number' });
        }

        // Fetch the teachers with pagination and filter
        const teachers = await Teacher.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

        res.status(200).json({ teachers, totalPages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get teachers', details: err.message });
    }
};

const approveTeacher = async (req, res) => {
    try {
      const teacherId = req.params.id;
  
      // Find the teacher by ID
      const teacher = await Teacher.findById(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
  
      // Update the teacher's account status
      teacher.accountStatus = 'active';
      await teacher.save();
  
      res.status(200).json({ message: 'Teacher approved successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to approve teacher', details: err.message });
    }
  };


module.exports = { signup, login, getTeacherById, getMyProfile, updateTeacher, deleteTeacher, approveTeacher, getTeachers, getUnactiveTeachers };
