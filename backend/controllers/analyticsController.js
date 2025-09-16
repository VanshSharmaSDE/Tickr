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

// Get tasks ranked by total completion count (all time - most completed to least completed)
const getTasksRankedByCompletion = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log('Getting all-time task completion rankings for user:', userId);
    
    // Get all user tasks
    const userTasks = await Task.find({ user: userId });
    
    if (userTasks.length === 0) {
      return res.json({
        message: 'No tasks found',
        tasks: []
      });
    }

    const taskIds = userTasks.map(task => task._id);
    
    // Get ALL task progress for this user (no date filtering)
    const taskProgress = await TaskProgress.find({
      user: userId,
      task: { $in: taskIds },
      completed: true // Only count completed tasks
    }).populate('task');
    
    // Count completions for each task
    const taskCompletionCounts = {};
    
    // Initialize all tasks with 0 completions
    userTasks.forEach(task => {
      taskCompletionCounts[task._id.toString()] = {
        task: task,
        completionCount: 0,
        completions: []
      };
    });
    
    // Count actual completions
    taskProgress.forEach(progress => {
      const taskId = progress.task._id.toString();
      if (taskCompletionCounts[taskId]) {
        taskCompletionCounts[taskId].completionCount++;
        taskCompletionCounts[taskId].completions.push({
          date: getIndiaDateString(progress.date),
          completedAt: progress.completedAt
        });
      }
    });
    
    // Convert to array and sort by completion count (highest to lowest)
    const rankedTasks = Object.values(taskCompletionCounts)
      .sort((a, b) => {
        // First sort by completion count (descending)
        if (b.completionCount !== a.completionCount) {
          return b.completionCount - a.completionCount;
        }
        // If completion counts are equal, sort by task creation date (newest first)
        return new Date(b.task.createdAt) - new Date(a.task.createdAt);
      })
      .map((item, index) => ({
        rank: index + 1,
        taskId: item.task._id,
        title: item.task.title,
        description: item.task.description,
        priority: item.task.priority,
        category: item.task.category,
        completionCount: item.completionCount,
        createdAt: item.task.createdAt,
        isCompleted: item.task.isCompleted,
        firstCompletedAt: item.completions.length > 0 
          ? item.completions[0].completedAt 
          : null,
        lastCompletedAt: item.completions.length > 0 
          ? item.completions[item.completions.length - 1].completedAt 
          : null
      }));

    // Calculate summary stats
    const totalTasks = rankedTasks.length;
    const tasksWithCompletions = rankedTasks.filter(task => task.completionCount > 0).length;
    const tasksWithoutCompletions = totalTasks - tasksWithCompletions;
    const totalCompletions = rankedTasks.reduce((sum, task) => sum + task.completionCount, 0);
    const averageCompletionsPerTask = totalTasks > 0 ? (totalCompletions / totalTasks).toFixed(2) : 0;
    
    // Top performers (tasks with most completions)
    const topPerformers = rankedTasks.slice(0, 10);
    
    // Bottom performers (tasks with least completions, excluding 0)
    const tasksWithNonZeroCompletions = rankedTasks.filter(task => task.completionCount > 0);
    const bottomPerformers = tasksWithNonZeroCompletions.slice(-10).reverse();

    const response = {
      success: true,
      summary: {
        totalTasks,
        tasksWithCompletions,
        tasksWithoutCompletions,
        totalCompletions,
        averageCompletionsPerTask: parseFloat(averageCompletionsPerTask),
        mostCompletedTask: rankedTasks[0] || null,
        leastCompletedTask: tasksWithNonZeroCompletions.length > 0 
          ? tasksWithNonZeroCompletions[tasksWithNonZeroCompletions.length - 1] 
          : null
      },
      topPerformers,
      bottomPerformers,
      allTasks: rankedTasks,
      generatedAt: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Task ranking error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch task rankings',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


module.exports = {
  getAnalytics,
  getTasksRankedByCompletion
};
