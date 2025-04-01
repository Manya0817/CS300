const { db } = require('../config/firebaseAdmin');
const cloudinary = require('../config/cloudinary');
const { sendNotificationToAllUsers } = require('./notificationController');

const uploadTimetable = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      console.error("No file received!");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log("Uploaded File Details:", {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: req.file.path, // Cloudinary URL
    });

    const { semester } = req.body || {};
    const fileUrl = req.file.path;

    console.log("Extracted Data -> Semester:", semester || "Not Specified");

    // Check if a timetable already exists for this semester
    const timetableRef = db.collection('semester-timetables');
    const snapshot = await timetableRef
      .where('semester', '==', semester || 'All')
      .get();

    if (!snapshot.empty) {
      // If there's already a document, return an error
      return res.status(409).json({ 
        message: 'A timetable already exists for this semester. Please delete the existing one first.',
        existingDocument: snapshot.docs[0].data() 
      });
    }

    // Create a new document in the semester-timetables collection
    const timetableData = {
      fileUrl,
      semester: semester || 'All',
      originalFilename: req.file.originalname,
      cloudinaryPublicId: req.file.filename || req.file.public_id, // Store Cloudinary public ID for deletion
      uploadedAt: new Date().toISOString()
    };

    const docRef = await timetableRef.add(timetableData);

    // Send notification using our custom notification system
    const notificationResult = await sendNotificationToAllUsers(
      "📅 New Class Timetable",
      `New timetable for Semester ${semester || 'All'} is now available`,
      { 
        type: 'semester_timetable',
        fileUrl,
        semester: semester || 'All',
        timestamp: new Date().toISOString(),
        documentId: docRef.id // Include the document ID for reference
      }
    );

    res.status(200).json({
      message: 'Class timetable uploaded successfully',
      fileUrl,
      documentId: docRef.id,
      notificationStats: {
        sent: notificationResult.successCount,
        failed: notificationResult.failureCount,
        notificationId: notificationResult.notificationId
      }
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};


const checkExistingTimetable = async (req, res) => {
  try {
    const { semester } = req.query;
    
    if (!semester) {
      return res.status(400).json({ 
        message: 'Semester is required for checking existing timetables' 
      });
    }
    
    const timetableRef = db.collection('semester-timetables');
    const snapshot = await timetableRef
      .where('semester', '==', semester)
      .get();

    res.json({ 
      exists: !snapshot.empty,
      data: snapshot.empty ? null : snapshot.docs[0].data(),
      documentId: snapshot.empty ? null : snapshot.docs[0].id
    });
  } catch (error) {
    console.error('Error checking timetables:', error);
    res.status(500).json({ 
      message: 'Failed to check existing timetables', 
      error: error.message 
    });
  }
};

// Function to get all timetables
const getAllTimetables = async (req, res) => {
  try {
    const timetableRef = db.collection('semester-timetables');
    const snapshot = await timetableRef.get();
    
    const timetables = [];
    snapshot.forEach(doc => {
      timetables.push({
        _id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetables',
      error: error.message
    });
  }
};

// Function to delete a timetable
const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the document first to check if it exists
    const docRef = db.collection('semester-timetables').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    const timetableData = doc.data();
    
    // Delete from Cloudinary if we have the public ID
    if (timetableData.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(timetableData.cloudinaryPublicId);
        console.log(`Deleted file from Cloudinary: ${timetableData.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with deletion from Firebase even if Cloudinary deletion fails
      }
    } else if (timetableData.fileUrl) {
      // Try to extract public ID from URL if no direct ID is stored
      try {
        const urlParts = timetableData.fileUrl.split('/');
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
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timetable',
      error: error.message
    });
  }
};

// Export all functions at the end
module.exports = { 
  uploadTimetable, 
  checkExistingTimetable,
  getAllTimetables,
  deleteTimetable
};