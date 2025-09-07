const express = require('express');
const auth = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTodayProgress,
  cleanupOrphanedProgress,
  getServerDate
} = require('../controllers/tasksController');

const router = express.Router();

// All routes are protected
router.use(auth);

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// GET /api/tasks/progress/today - Get today's progress
router.get('/progress/today', getTodayProgress);

// GET /api/tasks/:id - Get single task
router.get('/:id', getTask);

// POST /api/tasks - Create new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', deleteTask);

// POST /api/tasks/cleanup - Clean up orphaned progress records
router.post('/cleanup', cleanupOrphanedProgress);

// POST /api/tasks/:taskId/toggle - Toggle task completion
router.post('/:taskId/toggle', toggleTaskCompletion);

// GET /api/tasks/debug/date - Get server date info
router.get('/debug/date', getServerDate);

module.exports = router;
