const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const getAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = parseInt(req.query.limit) || 10; // Number of admins per page
    const filter = req.query.filter; // Filter keyword for first name or last name

    // Build the query object for filtering admins
    const query = {};

    if (filter) {
      query.$or = [
        { firstName: { $regex: filter, $options: 'i' } }, // Case-insensitive regex search for first name
        { lastName: { $regex: filter, $options: 'i' } } // Case-insensitive regex search for last name
      ];
    }

    // Count the total number of admins matching the filter
    const count = await Admin.countDocuments(query);

    // Calculate the total number of pages
    const totalPages = Math.ceil(count / limit);

    // Validate the current page number
    if (page > totalPages) {
      return res.status(400).json({ message: 'Invalid page number' });
    }

    // Fetch the admins with pagination
    const admins = await Admin.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ admins, totalPages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get admins', details: err.message });
  }
};

// Admin Signup
const adminSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, phoneNumber, role } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin object
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      phoneNumber,
      role
    });

    // Save admin to database
    await admin.save();

    // Send response with token and admin data
    res.status(201).json(admin);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate auth token
    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET);

    // Send response with token and admin data
    res.json({ token, admin });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id; // Admin ID to delete

    // Find and delete the admin
    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete admin', details: err.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const { firstName, lastName, email, birthDate, phoneNumber, role } = req.body;
    console.log(req);

    // Find the admin by ID
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Update the admin fields
    admin.firstName = firstName || admin.firstName;
    admin.lastName = lastName || admin.lastName;
    admin.email = email || admin.email;
    admin.birthDate = birthDate || admin.birthDate;
    admin.phoneNumber = phoneNumber || admin.phoneNumber;
    admin.role = role || admin.role;

    // Save the updated admin
    await admin.save();

    // Return the updated admin data
    const { password, ...adminData } = admin._doc;
    return res.json({ admin: adminData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update admin' });
  }
};

module.exports = {
  getAdmins,
  adminSignup,
  adminLogin,
  deleteAdmin,
  updateAdmin
};
