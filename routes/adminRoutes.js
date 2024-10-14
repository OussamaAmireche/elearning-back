const express = require('express');
const router = express.Router();
const { authAdmin, authSuperAdmin } = require('../middlewares/authAdmin');

const adminController = require('../controllers/adminController');

router.get('/', authSuperAdmin, adminController.getAdmins)
router.post('/login', adminController.adminLogin)
router.post('/signup' , authSuperAdmin, adminController.adminSignup)
router.put('/:id' , authSuperAdmin, adminController.updateAdmin)
router.delete('/:id' , authSuperAdmin, adminController.deleteAdmin)

module.exports = router;