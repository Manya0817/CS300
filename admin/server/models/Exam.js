const mongoose = require('mongoose');

const ExamScheduleSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['MidSemester', 'EndSemester', 'Other'],
    unique: true  // Make examType unique to ensure only one schedule per type
  },
  originalFilename: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String, 
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExamSchedule', ExamScheduleSchema);