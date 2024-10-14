const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authAdmin = async (req, res, next) => {
  try {
    // Get token from request headers
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find admin by ID and token
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      throw new Error();
    }

    // Attach admin object and token to request object
    req.admin = admin;
    req.token = token;

    // Call the next middleware
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const authSuperAdmin = async (req, res, next) => {
    try {
        // Get token from request headers
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find admin by ID and token
        const admin = await Admin.findById(decoded.adminId);

        if (!admin || admin.role !== 'Super Admin') {
        throw new Error();
        }

        // Attach admin object and token to request object
        req.admin = admin;
        req.token = token;

        // Call the next middleware
        next();
    } catch (err) {
        res.status(401).send({ error: 'Please authenticate as a Super Admin.' });
    }
};

module.exports = { authAdmin, authSuperAdmin };
