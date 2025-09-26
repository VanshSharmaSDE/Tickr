const express = require('express');
const auth = require('../middleware/auth');
const {
  getFocusMode,
  enableFocusMode,
  disableFocusMode,
  addFocusTask,
  removeFocusTask,
  reorderFocusTasks,
  getAvailableTasks
} = require('../controllers/focusController');

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/focus - Get focus mode status and tasks
router.get('/', getFocusMode);

// POST /api/focus/enable - Enable focus mode (clears existing)
router.post('/enable', enableFocusMode);

// POST /api/focus/disable - Disable focus mode (clears all tasks)
router.post('/disable', disableFocusMode);

// GET /api/focus/available - Get available tasks to add to focus mode
router.get('/available', getAvailableTasks);

// POST /api/focus/tasks - Add existing task to focus mode
router.post('/tasks', addFocusTask);

// DELETE /api/focus/tasks/:focusId - Remove task from focus mode
router.delete('/tasks/:focusId', removeFocusTask);

// PUT /api/focus/reorder - Reorder focus tasks
router.put('/reorder', reorderFocusTasks);

module.exports = router;