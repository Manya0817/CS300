const { sendNotificationToAllUsers } = require('../config/firebaseAdmin');

const uploadExamSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { examType, batchYear } = req.body || {};
    const fileUrl = req.file.path;

    // Send notification
    const { successCount, failureCount } = await sendNotificationToAllUsers(
      "📝 New Exam Schedule",
      `New ${examType || 'exam'} schedule for ${batchYear || 'all batches'} available`,
      { 
        type: 'exam_schedule',
        fileUrl,
        examType: examType || 'General',
        batchYear: batchYear || 'All',
        timestamp: new Date().toISOString()
      }
    );

    res.status(200).json({
      message: 'Exam schedule uploaded successfully',
      fileUrl,
      notificationStats: {
        sent: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed',
      error: error.message 
    });
  }
};

module.exports = { uploadExamSchedule };