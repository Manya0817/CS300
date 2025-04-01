const { db } = require('../config/firebaseAdmin');

// Send notification to all users
const sendNotificationToAllUsers = async (title, body, data = {}) => {
  try {
    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found to send notifications');
      return { successCount: 0, failureCount: 0 };
    }
    
    // Create notification document in notifications collection
    const notificationData = {
      title,
      body,
      data,
      createdAt: new Date().toISOString(),
      readBy: [], // Empty array to track which users have read this notification
      sentTo: [] // Will store user IDs who received this notification
    };
    
    // Add notification to collection
    const notificationRef = await db.collection('notifications').add(notificationData);
    const notificationId = notificationRef.id;
    
    console.log(`Created notification document with ID: ${notificationId}`);
    
    // Count success and failures
    let successCount = 0;
    let failureCount = 0;
    const batch = db.batch(); // Use batch write for better performance
    
    // For each user, add this notification to their user-notifications collection
    usersSnapshot.forEach(userDoc => {
      try {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Skip sending to users who have disabled notifications (if they have that setting)
        if (userData.notificationEnabled === false) {
          console.log(`Skipping notification for user ${userId} (notifications disabled)`);
          return;
        }
        
        // Create user-specific notification reference
        const userNotificationRef = db.collection('user-notifications').doc();
        
        // Prepare user notification data
        const userNotificationData = {
          userId,
          notificationId,
          title,
          body,
          data,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        // Add to batch
        batch.set(userNotificationRef, userNotificationData);
        
        // Add user to the sentTo array for tracking
        notificationData.sentTo.push(userId);
        
        successCount++;
      } catch (err) {
        console.error(`Error preparing notification for user: ${userDoc.id}`, err);
        failureCount++;
      }
    });
    
    // Commit the batch
    await batch.commit();
    console.log(`Batch write completed for ${successCount} users`);
    
    // Update the notification document with the list of users it was sent to
    await db.collection('notifications').doc(notificationId).update({
      sentTo: notificationData.sentTo
    });
    
    return { successCount, failureCount, notificationId };
  } catch (error) {
    console.error('Error sending notifications:', error);
    throw error;
  }
};

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Query notifications for this specific user
    const userNotificationsSnapshot = await db
      .collection('user-notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const notifications = [];
    userNotificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    if (!notificationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID and User ID are required'
      });
    }
    
    // Find the user-specific notification
    const userNotificationsSnapshot = await db
      .collection('user-notifications')
      .where('notificationId', '==', notificationId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (userNotificationsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found for this user'
      });
    }
    
    // Update the user-notification document
    const userNotificationDoc = userNotificationsSnapshot.docs[0];
    await userNotificationDoc.ref.update({ read: true });
    
    // Also update the main notification document to track which users have read it
    const notificationRef = db.collection('notifications').doc(notificationId);
    await notificationRef.update({
      readBy: db.FieldValue.arrayUnion(userId)
    });
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Delete a user notification
const deleteUserNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;
    
    if (!notificationId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID and User ID are required'
      });
    }
    
    // Find the user-specific notification
    const userNotificationsSnapshot = await db
      .collection('user-notifications')
      .where('notificationId', '==', notificationId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (userNotificationsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found for this user'
      });
    }
    
    // Delete the user-notification document
    const userNotificationDoc = userNotificationsSnapshot.docs[0];
    await userNotificationDoc.ref.delete();
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Get unread notification count for a user
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }
    
    // Count unread notifications for this user
    const unreadSnapshot = await db
      .collection('user-notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();
    
    return res.status(200).json({
      success: true,
      count: unreadSnapshot.size
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

module.exports = {
  sendNotificationToAllUsers,
  getUserNotifications,
  markNotificationAsRead,
  deleteUserNotification,
  getUnreadCount
};