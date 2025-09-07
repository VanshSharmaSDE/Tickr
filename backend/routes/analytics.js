const express = require('express');
const auth = require('../middleware/auth');
const {
  getAnalytics
} = require('../controllers/analyticsController');

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/analytics - Get analytics with optional days parameter
router.get('/', getAnalytics);

module.exports = router;
