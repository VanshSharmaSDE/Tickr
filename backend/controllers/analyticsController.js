const Task = require('../models/Task');
const TaskProgress = require('../models/TaskProgress');

// Helper function to get India timezone date
const getIndiaDate = (date = new Date()) => {
  // Add IST offset (UTC + 5:30)
  const indiaTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
  return indiaTime;
};

// Helper function to get date string in India timezone
const getIndiaDateString = (date = new Date()) => {
  const indiaDate = getIndiaDate(date);
  return indiaDate.toISOString().split('T')[0];
};

// Get analytics data for a user with up to 365 days of data
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;
    
    // Limit to maximum 365 days
    const maxDays = Math.min(parseInt(days), 365);
    
    // Calculate date range using India timezone (UTC+5:30)
    const now = new Date();
    const indiaDateString = getIndiaDateString(now);
    
    // Create end date as the end of today in India timezone
    const endDate = new Date(indiaDateString + 'T18:29:59.999Z'); // End of day in IST (23:59:59.999 IST = 18:29:59.999 UTC)
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - maxDays + 1); // +1 to include today

    console.log('Analytics date range (India):', startDate.toDateString(), 'to', endDate.toDateString());
    
    // Get all user tasks
    const userTasks = await Task.find({ user: userId });
    const taskIds = userTasks.map(task => task._id);
    
    // Get task progress within date range
    const taskProgress = await TaskProgress.find({
      user: userId,
      task: { $in: taskIds },
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('task');
    
    // Calculate basic stats
    const totalTasks = userTasks.length;
    let completedTasks = 0;
    const dailyStats = [];
    const priorityBreakdown = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 }
    };
    
    // Count priority totals
    userTasks.forEach(task => {
      priorityBreakdown[task.priority].total++;
    });
    
    // Process daily stats and priority completion
    const progressByDate = {};
    const taskProgressByDate = {}; // New: Track progress for each task by date
    const completedTaskIds = new Set();
    
    // Initialize task progress tracking
    userTasks.forEach(task => {
      taskProgressByDate[task._id] = {};
    });
    
    taskProgress.forEach(progress => {
      // Convert to India timezone date string
      const dateKey = getIndiaDateString(progress.date);
      
      if (!progressByDate[dateKey]) {
        progressByDate[dateKey] = {
          date: dateKey,
          tasks: [],
          completed: 0,
          total: 0
        };
      }
      
      progressByDate[dateKey].tasks.push(progress);
      progressByDate[dateKey].total++;
      
      // Track individual task progress for this date
      if (progress.task) {
        taskProgressByDate[progress.task._id][dateKey] = {
          completed: progress.completed,
          completedAt: progress.completedAt
        };
      }
      
      if (progress.completed) {
        progressByDate[dateKey].completed++;
        completedTaskIds.add(progress.task._id.toString());
        
        // Count priority completion
        if (progress.task) {
          priorityBreakdown[progress.task.priority].completed++;
        }
      }
    });
    
    // Generate daily stats array
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      // Convert to India timezone for consistent date key
      const dateKey = getIndiaDateString(date);
      
      const dayData = progressByDate[dateKey] || {
        date: dateKey,
        completed: 0,
        total: 0
      };
      
      const completionRate = dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0;
      
      dailyStats.push({
        date: dateKey,
        completed: dayData.completed,
        total: dayData.total,
        completionRate: Math.round(completionRate * 10) / 10
      });
    }
    
    // Calculate overall completion rate
    completedTasks = completedTaskIds.size;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Prepare response
    const analytics = {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 10) / 10,
      dailyStats: dailyStats.sort((a, b) => new Date(b.date) - new Date(a.date)),
      priorityBreakdown,
      tasks: userTasks.map(task => ({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        createdAt: task.createdAt
      })),
      taskProgressByDate,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        days: maxDays
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAnalytics
};
