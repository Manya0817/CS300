const admin = require("firebase-admin");
require('dotenv').config();

// Create serviceAccount object from environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // Make sure to parse the private key properly
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

// Initialize Firebase app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET
});

// Get Firebase services
const db = admin.firestore();
const auth = admin.auth();
let messaging;

try {
  // Messaging might not be available in some environments
  messaging = admin.messaging();
} catch (error) {
  console.warn('Firebase Messaging not initialized:', error.message);
}

// Save FCM token function
const saveFcmToken = async (userId, token) => {
  if (!token) return;
  
  try {
    const tokenData = {
      token,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(userId).collection('tokens').doc(token).set(tokenData);
    console.log(`FCM Token saved for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};

// Remove FCM token function
const removeFcmToken = async (userId, token) => {
  if (!token) return;
  
  try {
    await db.collection('users').doc(userId).collection('tokens').doc(token).delete();
    console.log(`FCM Token removed for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('Error removing FCM token:', error);
    return false;
  }
};

// Send notification to all users
const sendNotificationToAllUsers = async (title, body, data = {}) => {
  if (!messaging) {
    throw new Error('Firebase Messaging not initialized');
  }
  
  try {
    // Get all tokens from all users
    const tokensSnapshot = await db.collectionGroup('tokens').get();
    
    if (tokensSnapshot.empty) {
      console.log('No FCM tokens found');
      return { successCount: 0, failureCount: 0 };
    }
    
    const tokens = tokensSnapshot.docs.map(doc => doc.id);
    console.log(`Found ${tokens.length} FCM tokens`);
    
    // Firebase has a limit of 500 tokens per request
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < tokens.length; i += batchSize) {
      batches.push(tokens.slice(i, i + batchSize));
    }
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const batch of batches) {
      const message = {
        notification: { title, body },
        data: { ...data, click_action: 'FLUTTER_NOTIFICATION_CLICK' },
        tokens: batch
      };

      const response = await messaging.sendMulticast(message);
      successCount += response.successCount;
      failureCount += response.failureCount;

      // Log failures
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${batch[idx]}:`, resp.error);
        }
      });
    }

    console.log(`Sent ${successCount} notifications, ${failureCount} failed`);
    return { successCount, failureCount };
  } catch (error) {
    console.error('Error in sendNotificationToAllUsers:', error);
    throw error;
  }
};

module.exports = {
  admin,
  db,
  auth,
  messaging,
  saveFcmToken,
  removeFcmToken,
  sendNotificationToAllUsers
};