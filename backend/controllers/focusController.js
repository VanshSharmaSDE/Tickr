const Focus = require('../models/Focus');
const Task = require('../models/Task');

// Get focus mode status and tasks
const getFocusMode = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all focus entries for the user
    const focusEntries = await Focus.find({ user: userId })
      .sort({ order: 1, addedToFocusAt: 1 });
    
    const totalTasks = focusEntries.length;
    
    res.json({
      success: true,
      isEnabled: totalTasks > 0,
      totalTasks: totalTasks,
      tasks: focusEntries.map(entry => ({
        focusId: entry._id,
        taskId: entry.task,
        order: entry.order,
        addedToFocusAt: entry.addedToFocusAt
      }))
    });
    
  } catch (error) {
    console.error('Get focus mode error:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve focus mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Enable focus mode (clear existing focus entries)
const enableFocusMode = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Clear existing focus entries
    await Focus.deleteMany({ user: userId });
    
    res.json({
      success: true,
      message: 'Focus mode enabled. Ready to add tasks.',
      isEnabled: true,
      tasks: []
    });
    
  } catch (error) {
    console.error('Enable focus mode error:', error);
    res.status(500).json({ 
      message: 'Failed to enable focus mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Disable focus mode (clear all focus entries)
const disableFocusMode = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Delete all focus entries
    const result = await Focus.deleteMany({ user: userId });
    
    res.json({
      success: true,
      message: `Focus mode disabled. ${result.deletedCount} tasks removed from focus.`,
      isEnabled: false,
      tasks: []
    });
    
  } catch (error) {
    console.error('Disable focus mode error:', error);
    res.status(500).json({ 
      message: 'Failed to disable focus mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add existing task to focus mode
const addFocusTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.body;
    
    // Validate required fields
    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }
    
    // Check if task exists and belongs to user
    const task = await Task.findOne({ _id: taskId, user: userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Check if task is already in focus mode
    const existingFocus = await Focus.findOne({ user: userId, task: taskId });
    if (existingFocus) {
      return res.status(400).json({ message: 'Task is already in focus mode' });
    }
    
    // Get the next order number
    const lastFocus = await Focus.findOne({ user: userId }).sort({ order: -1 });
    const nextOrder = lastFocus ? lastFocus.order + 1 : 1;
    
    // Create new focus entry
    const focusEntry = new Focus({
      user: userId,
      task: taskId,
      order: nextOrder
    });
    
    await focusEntry.save();
    
    // Get updated focus list with populated tasks
    const focusEntries = await Focus.find({ user: userId })
      .populate('task')
      .sort({ order: 1 });
    
    res.status(201).json({
      success: true,
      message: 'Task added to focus mode',
      focusEntry: {
        focusId: focusEntry._id,
        order: focusEntry.order,
        addedToFocusAt: focusEntry.addedToFocusAt,
        task: task
      },
      tasks: focusEntries.map(entry => ({
        focusId: entry._id,
        order: entry.order,
        addedToFocusAt: entry.addedToFocusAt,
        task: entry.task
      })),
      totalTasks: focusEntries.length
    });
    
  } catch (error) {
    console.error('Add focus task error:', error);
    res.status(500).json({ 
      message: 'Failed to add task to focus mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove task from focus mode
const removeFocusTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { focusId } = req.params;
    
    const deletedFocus = await Focus.findOneAndDelete({ _id: focusId, user: userId });
    
    if (!deletedFocus) {
      return res.status(404).json({ message: 'Focus entry not found' });
    }
    
    // Reorder remaining focus entries
    const remainingEntries = await Focus.find({ user: userId }).sort({ order: 1 });
    
    // Update order numbers
    for (let i = 0; i < remainingEntries.length; i++) {
      if (remainingEntries[i].order !== i + 1) {
        await Focus.findByIdAndUpdate(remainingEntries[i]._id, { order: i + 1 });
      }
    }
    
    // Get updated focus list with populated tasks
    const focusEntries = await Focus.find({ user: userId })
      .populate('task')
      .sort({ order: 1 });
    
    res.json({
      success: true,
      message: 'Task removed from focus mode',
      tasks: focusEntries.map(entry => ({
        focusId: entry._id,
        order: entry.order,
        addedToFocusAt: entry.addedToFocusAt,
        task: entry.task
      })),
      totalTasks: focusEntries.length
    });
    
  } catch (error) {
    console.error('Remove focus task error:', error);
    res.status(500).json({ 
      message: 'Failed to remove task from focus mode',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Reorder focus tasks
const reorderFocusTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { focusOrders } = req.body; // Array of { focusId, order }
    
    if (!Array.isArray(focusOrders)) {
      return res.status(400).json({ message: 'focusOrders must be an array' });
    }
    
    // Update each focus entry's order
    const updatePromises = focusOrders.map(({ focusId, order }) => 
      Focus.findOneAndUpdate(
        { _id: focusId, user: userId },
        { order: order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Get updated focus list with populated tasks
    const focusEntries = await Focus.find({ user: userId })
      .populate('task')
      .sort({ order: 1 });
    
    res.json({
      success: true,
      message: 'Focus tasks reordered successfully',
      tasks: focusEntries.map(entry => ({
        focusId: entry._id,
        order: entry.order,
        addedToFocusAt: entry.addedToFocusAt,
        task: entry.task
      }))
    });
    
  } catch (error) {
    console.error('Reorder focus tasks error:', error);
    res.status(500).json({ 
      message: 'Failed to reorder focus tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get available tasks to add to focus mode
const getAvailableTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all user tasks
    const allTasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    
    // Get tasks already in focus mode
    const focusEntries = await Focus.find({ user: userId });
    const focusTaskIds = focusEntries.map(entry => entry.task.toString());
    
    // Filter out tasks already in focus mode
    const availableTasks = allTasks.filter(task => !focusTaskIds.includes(task._id.toString()));
    
    res.json({
      success: true,
      availableTasks: availableTasks,
      totalAvailable: availableTasks.length
    });
    
  } catch (error) {
    console.error('Get available tasks error:', error);
    res.status(500).json({ 
      message: 'Failed to get available tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getFocusMode,
  enableFocusMode,
  disableFocusMode,
  addFocusTask,
  removeFocusTask,
  reorderFocusTasks,
  getAvailableTasks
};