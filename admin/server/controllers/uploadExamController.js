const { db } = require('../config/firebaseAdmin'); // Import Firebase db
const cloudinary = require('../config/cloudinary');
const { sendNotificationToAllUsers } = require('./notificationController');

// Define all functions first, then export them at the end

const uploadExamSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { examType, batchYear } = req.body || {};
    const fileUrl = req.file.path;

    // Check if an exam schedule already exists for this type and batch
    const examRef = db.collection('exam-schedules');
    const snapshot = await examRef
      .where('examType', '==', examType || 'General')
      .where('batchYear', '==', batchYear || 'All')
      .get();

    if (!snapshot.empty) {
      // If there's already a document, return an error
      return res.status(409).json({ 
        message: 'An exam schedule already exists for this exam type and batch. Please delete the existing one first.',
        existingDocument: snapshot.docs[0].data() 
      });
    }

    // Create a new document in the exam-schedules collection
    const examData = {
      fileUrl,
      examType: examType || 'General',
      batchYear: batchYear || 'All',
      uploadedAt: new Date().toISOString(),
      originalFilename: req.file.originalname,
      cloudinaryPublicId: req.file.filename || req.file.public_id // Store Cloudinary public ID for deletion
    };

    const docRef = await examRef.add(examData);

    // Send notification using our custom notification system
    const notificationResult = await sendNotificationToAllUsers(
      "📝 New Exam Schedule",
      `New ${examType || 'exam'} schedule for ${batchYear || 'all batches'} available`,
      { 
        type: 'exam_schedule',
        fileUrl,
        examType: examType || 'General',
        batchYear: batchYear || 'All',
        timestamp: new Date().toISOString(),
        documentId: docRef.id // Include the document ID for reference
      }
    );

    res.status(200).json({
      message: 'Exam schedule uploaded successfully',
      fileUrl,
      documentId: docRef.id,
      notificationStats: {
        sent: notificationResult.successCount,
        failed: notificationResult.failureCount,
        notificationId: notificationResult.notificationId
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

// Function to check if an exam schedule exists
const checkExistingSchedule = async (req, res) => {
  try {
    const { examType, batchYear } = req.query;
    
    if (!examType || !batchYear) {
      return res.status(400).json({ 
        message: 'Exam type and batch year are required for checking existing schedules' 
      });
    }
    
    const examRef = db.collection('exam-schedules');
    const snapshot = await examRef
      .where('examType', '==', examType)
      .where('batchYear', '==', batchYear)
      .get();

    res.json({ 
      exists: !snapshot.empty,
      data: snapshot.empty ? null : snapshot.docs[0].data(),
      documentId: snapshot.empty ? null : snapshot.docs[0].id
    });
  } catch (error) {
    console.error('Error checking exam schedules:', error);
    res.status(500).json({ 
      message: 'Failed to check existing schedules', 
      error: error.message 
    });
  }
};

// Function to get all exam schedules
const getAllExamSchedules = async (req, res) => {
  try {
    const examRef = db.collection('exam-schedules');
    const snapshot = await examRef.get();
    
    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({
        _id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching exam schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exam schedules',
      error: error.message
    });
  }
};

// Function to delete an exam schedule
const deleteExamSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the document first to check if it exists
    const docRef = db.collection('exam-schedules').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Exam schedule not found'
      });
    }
    
    const examData = doc.data();
    
    // Delete from Cloudinary if we have the public ID
    if (examData.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(examData.cloudinaryPublicId);
        console.log(`Deleted file from Cloudinary: ${examData.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with deletion from Firebase even if Cloudinary deletion fails
      }
    } else if (examData.fileUrl) {
      // Try to extract public ID from URL if no direct ID is stored
      try {
        const urlParts = examData.fileUrl.split('/');
        const filenameWithExtension = urlParts[urlParts.length - 1];
        const publicId = filenameWithExtension.split('.')[0];
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted file from Cloudinary using URL: ${publicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary using URL:', cloudinaryError);
        // Continue with deletion from Firebase even if Cloudinary deletion fails
      }
    }
    
    // Delete the document from Firebase
    await docRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Exam schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting exam schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete exam schedule',
      error: error.message
    });
  }
};

// Export all functions at the end
module.exports = { 
  uploadExamSchedule, 
  checkExistingSchedule,
  getAllExamSchedules,
  deleteExamSchedule
};