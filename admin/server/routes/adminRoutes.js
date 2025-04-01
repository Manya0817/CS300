const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/authMiddleware');
const { 
  initializeAdmin,
  registerFacultyHead, 
  registerStudentHead,
  getAllFacultyHeads,
  getAllStudentHeads
} = require('../controllers/adminController');

// Public route - initialize admin (should be protected in production)
router.post('/initialize-admin', initializeAdmin);

// Protected routes - require admin authentication
router.post('/faculty-head/register', adminAuth, registerFacultyHead);
router.post('/student-head/register', adminAuth, registerStudentHead);
router.get('/faculty-head/all', adminAuth, getAllFacultyHeads);
router.get('/student-head/all', adminAuth, getAllStudentHeads);

module.exports = router;