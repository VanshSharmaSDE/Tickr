const express = require('express');
const auth = require('../middleware/auth');
const {
  getUserSettings,
  updateUserSettings,
  updateSpecificSetting,
  resetUserSettings
} = require('../controllers/settingsController');

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/settings - Get user settings
router.get('/', getUserSettings);

// PUT /api/settings - Update user settings (can update multiple fields)
router.put('/', updateUserSettings);

// PATCH /api/settings/update - Update specific setting
router.patch('/update', updateSpecificSetting);

// POST /api/settings/reset - Reset settings to default
router.post('/reset', resetUserSettings);

module.exports = router;
