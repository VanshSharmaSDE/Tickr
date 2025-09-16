const express = require('express');
const auth = require('../middleware/auth');
const {
  getAnalytics,
  getTasksRankedByCompletion
} = require('../controllers/analyticsController');

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/analytics - Get analytics with optional days parameter
router.get('/', getAnalytics);

// GET /api/analytics/task-rankings - Get tasks ranked by completion count
router.get('/task-rankings', getTasksRankedByCompletion);

module.exports = router;
