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
  
      console.log("Extracted Data -> Semester:", semester || "Not Specified");
  
      return res.status(200).json({
        message: 'Class timetable uploaded successfully',
        fileUrl: req.file.path, // Cloudinary file URL
        details: {
          semester: semester || 'Not Specified',
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  };
  
module.exports = { uploadTimetable };
  