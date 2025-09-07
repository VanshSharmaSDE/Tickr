const Task = require('../models/Task');
const TaskProgress = require('../models/TaskProgress');

// Helper function to get India timezone date
const getIndiaDate = (date = new Date()) => {
  // Add IST offset (UTC + 5:30)
  const indiaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return indiaTime;
};

// Get all tasks for a user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const task = new Task({
      title,
      description,
      priority,
      user: req.user.userId
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { title, description, priority },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task (soft delete) and clean up TaskProgress
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    // First verify the task exists and belongs to the user
    const task = await Task.findOne({ _id: taskId, user: userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Permanently delete all TaskProgress records associated with this task
    const deletedProgress = await TaskProgress.deleteMany({ 
      task: taskId, 
      user: userId 
    });

    // Permanently delete the task
    await Task.findByIdAndDelete(taskId);

    console.log(`Permanently deleted task ${taskId} and ${deletedProgress.deletedCount} progress records`);

    res.json({ 
      message: 'Task and its progress history permanently deleted',
      deletedProgressRecords: deletedProgress.deletedCount
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clean up orphaned TaskProgress records (utility function)
const cleanupOrphanedProgress = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all task IDs for this user
    const existingTasks = await Task.find({ user: userId }).select('_id');
    const existingTaskIds = existingTasks.map(task => task._id);

    // Find TaskProgress records that reference non-existent tasks
    const orphanedProgress = await TaskProgress.deleteMany({
      user: userId,
      task: { $nin: existingTaskIds }
    });

    res.json({
      message: 'Cleanup completed',
      deletedOrphanedRecords: orphanedProgress.deletedCount
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle task completion for today
const toggleTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Get today's date in India timezone
    const today = getIndiaDate();
    today.setHours(0, 0, 0, 0);

    console.log('Toggle task - India date:', today.toDateString(), today.toISOString());

    // Check if task belongs to user
    const task = await Task.findOne({ _id: taskId, user: req.user.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find or create task progress for today
    let taskProgress = await TaskProgress.findOne({
      user: req.user.userId,
      task: taskId,
      date: today
    });

    if (!taskProgress) {
      taskProgress = new TaskProgress({
        user: req.user.userId,
        task: taskId,
        date: today,
        completed: true,
        completedAt: new Date()
      });
    } else {
      taskProgress.completed = !taskProgress.completed;
      taskProgress.completedAt = taskProgress.completed ? new Date() : null;
    }

    await taskProgress.save();
    res.json(taskProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get today's task progress
const getTodayProgress = async (req, res) => {
  try {
    // Get today's date in India timezone
    const today = getIndiaDate();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Get today progress - India date range:', today.toDateString(), 'to', tomorrow.toDateString());

    const progress = await TaskProgress.find({
      user: req.user.userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('task');

    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Debug endpoint to check server date
const getServerDate = async (req, res) => {
  try {
    const now = new Date();
    const indiaTime = getIndiaDate(now);
    const today = getIndiaDate();
    today.setHours(0, 0, 0, 0);
    
    res.json({
      serverTime: now.toISOString(),
      serverDate: now.toDateString(),
      indiaTime: indiaTime.toISOString(),
      indiaDate: indiaTime.toDateString(),
      todayForComparison: today.toISOString(),
      day: indiaTime.getDate(),
      month: indiaTime.getMonth() + 1,
      year: indiaTime.getFullYear()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTodayProgress,
  cleanupOrphanedProgress,
  getServerDate
};
