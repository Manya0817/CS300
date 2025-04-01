const express = require('express');
const { uploadExamSchedule } = require('../controllers/uploadExamController');
const { uploadExamSchedule1 } = require('../middleware/multer');

const router = express.Router();

router.post('/upload-exam', uploadExamSchedule1.single('file'), uploadExamSchedule);

module.exports = router;
