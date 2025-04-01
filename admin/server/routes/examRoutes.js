const express = require('express');
const { 
  uploadExamSchedule, 
  checkExistingSchedule,
  getAllExamSchedules,
  deleteExamSchedule
} = require('../controllers/uploadExamController');
const { uploadExamSchedule1 } = require('../middleware/multer');

const router = express.Router();

// Upload exam schedule endpoint
router.post('/upload-exam', uploadExamSchedule1.single('file'), uploadExamSchedule);

// Check existing exam schedule endpoint
router.get('/check', checkExistingSchedule);

// Get all exam schedules
router.get('/all', getAllExamSchedules);

// Delete an exam schedule
router.delete('/:id', deleteExamSchedule);

module.exports = router;