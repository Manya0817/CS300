const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: [true, 'Please specify the semester'],
    min: 1,
    max: 8
  },
  originalFilename: {
    type: String,
    required: [true, 'Please provide the original filename']
  },
  filename: {
    type: String,
    required: [true, 'Please provide the filename']
  },
  filePath: {
    type: String,
    required: [true, 'Please provide the file path in storage']
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide the public file URL']
  },
  uploadedBy: {
    type: String, // User ID of the uploader
    required: [true, 'Please provide the uploader ID']
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

module.exports = mongoose.model('Timetable', TimetableSchema);