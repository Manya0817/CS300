const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

console.log("Initializing Multer for Cloudinary...");

// Cloudinary Storage Configuration for Exam Schedules
const examStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: `exam-schedules/${req.body.batchYear || 'All'}/${req.body.examType || 'Unspecified'}`,
    resource_type: 'image',
    public_id: file.originalname.split('.')[0],
    format: 'jpg',
    page: 1,
    access_mode: 'public'
  })
});

// Cloudinary Storage Configuration for Semester Timetables
const timetableStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: `semester-timetables/Semester-${req.body.semester || 'Unspecified'}`,
    resource_type: 'image',
    public_id: file.originalname.split('.')[0],
    format: 'jpg',
    page: 1,
    access_mode: 'public'
  })
});

// Multer Configurations
const uploadExamSchedule1 = multer({
  storage: examStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    console.log("Checking file type...");
    if (file.mimetype === 'application/pdf') {
      console.log("File type is valid.");
      cb(null, true);
    } else {
      console.error("Invalid file type:", file.mimetype);
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

const uploadTimetable1 = multer({
  storage: timetableStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    console.log("Checking file type...");
    if (file.mimetype === 'application/pdf') {
      console.log("File type is valid.");
      cb(null, true);
    } else {
      console.error("Invalid file type:", file.mimetype);
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

console.log("Multer setup complete. Ready to receive files.");

module.exports = { uploadExamSchedule1, uploadTimetable1 };
