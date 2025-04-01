const express = require('express');
const { uploadTimetable1 } = require('../middleware/multer');
const { uploadTimetable } = require('../controllers/uploadTimeTable');

const router = express.Router();
router.post('/upload-timetable', uploadTimetable1.single('file'), uploadTimetable)

module.exports = router;