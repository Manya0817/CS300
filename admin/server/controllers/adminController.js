const { admin } = require('../config/firebaseAdmin');

const initializeAdmin = async () => {
  try {
    const adminEmail = 'admin@iiitg.ac.in';
    const adminPassword = 'admin@1234';
    
    // Check if admin already exists
    try {
      const userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log('Admin already exists:', userRecord.uid);
      return { success: true, message: 'Admin already exists', uid: userRecord.uid };
    } catch (error) {
      // User doesn't exist, create it
      if (error.code === 'auth/user-not-found') {
        // Create user with email and password
        const userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: 'Admin'
        });
        
        // Set custom claims for admin
        await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        
        // Store admin data in Firestore (no FCM needed for admin)
        await admin.firestore().collection('users').doc(userRecord.uid).set({
          name: 'Admin',
          email: adminEmail,
          role: 'admin',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          fcmToken: null, // Explicitly set to null for admin
          notificationEnabled: false // Admin doesn't need notifications
        });
        
        console.log('Admin created successfully:', userRecord.uid);
        return { success: true, message: 'Admin created successfully', uid: userRecord.uid };
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
};

// Register a new faculty head with FCM fields
const registerFacultyHead = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (!email.endsWith('@iiitg.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Faculty must use an IIITG email address'
      });
    }
    
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone ? `+91${phone}` : undefined
    });
    
    // Set custom claims for faculty head
    await admin.auth().setCustomUserClaims(userRecord.uid, { facultyHead: true });
    
    // Store user data in Firestore with FCM fields
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      phone: phone || null,
      role: 'faculty-head',
      fcmToken: null, // Will be set when user enables notifications
      notificationEnabled: false, // Default to false
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'admin'
    });
    
    return res.status(201).json({
      success: true,
      message: 'Faculty Head registered successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error registering faculty head:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register faculty head',
      error: error.message
    });
  }
};

// Register a new student head with FCM fields
const registerStudentHead = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    if (!email.endsWith('@iiitg.ac.in')) {
      return res.status(400).json({
        success: false,
        message: 'Student must use an IIITG email address'
      });
    }
    
    // Check if user already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone ? `+91${phone}` : undefined
    });
    
    // Set custom claims for student head
    await admin.auth().setCustomUserClaims(userRecord.uid, { studentHead: true });
    
    // Store user data in Firestore with FCM fields
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      name,
      email,
      phone: phone || null,
      role: 'student-head',
      fcmToken: null, // Will be set when user enables notifications
      notificationEnabled: false, // Default to false
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'admin'
    });
    
    return res.status(201).json({
      success: true,
      message: 'Student Head registered successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error registering student head:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register student head',
      error: error.message
    });
  }
};

// Get all faculty heads (unchanged)
const getAllFacultyHeads = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('users')
      .where('role', '==', 'faculty-head')
      .get();
    
    const facultyHeads = [];
    snapshot.forEach(doc => {
      facultyHeads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      count: facultyHeads.length,
      data: facultyHeads
    });
  } catch (error) {
    console.error('Error getting faculty heads:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve faculty heads',
      error: error.message
    });
  }
};

// Get all student heads (unchanged)
const getAllStudentHeads = async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('users')
      .where('role', '==', 'student-head')
      .get();
    
    const studentHeads = [];
    snapshot.forEach(doc => {
      studentHeads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      count: studentHeads.length,
      data: studentHeads
    });
  } catch (error) {
    console.error('Error getting student heads:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student heads',
      error: error.message
    });
  }
};

module.exports = {
  initializeAdmin,
  registerFacultyHead,
  registerStudentHead,
  getAllFacultyHeads,
  getAllStudentHeads
};