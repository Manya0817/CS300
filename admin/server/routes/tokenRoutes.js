const express = require('express');
const router = express.Router();
const { saveFcmToken } = require('../config/firebaseAdmin');

// POST /api/save-fcm-token
router.post('/save-fcm-token', async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({ error: 'Missing userId or token' });
    }

    await saveFcmToken(userId, token);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: error.message });
  }
});
// Add this route
router.post('/remove-fcm-token', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
      }
      
      await removeFcmToken(userId);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error removing token:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;