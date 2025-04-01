const express = require('express');
const {
  getUserNotifications,
  markNotificationAsRead,
  deleteUserNotification,
  getUnreadCount
} = require('../controllers/notificationController');

const router = express.Router();

// Get all notifications for a user
router.get('/user/:userId', getUserNotifications);

// Get unread notification count
router.get('/unread/:userId', getUnreadCount);

// Mark notification as read
router.put('/read/:notificationId', markNotificationAsRead);

// Delete a notification
router.delete('/:notificationId', deleteUserNotification);

module.exports = router;