const express = require('express');
const { 
  uploadTimetable, 
  checkExistingTimetable,
  getAllTimetables,
  deleteTimetable
} = require('../controllers/uploadTimeTable');
const { uploadTimetable1 } = require('../middleware/multer');

const router = express.Router();

// Upload timetable endpoint
router.post('/upload', uploadTimetable1.single('file'), uploadTimetable);

// Check existing timetable endpoint
router.get('/check', checkExistingTimetable);

// Get all timetables
router.get('/all', getAllTimetables);

// Delete a timetable
router.delete('/:id', deleteTimetable);

module.exports = router;