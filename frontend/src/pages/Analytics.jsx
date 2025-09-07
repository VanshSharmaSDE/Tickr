import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBarChart, 
  FiTrendingUp, 
  FiCalendar, 
  FiTarget,
  FiCheckCircle,
} from 'react-icons/fi';
import { analyticsService } from '../services/analyticsService';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(28); // Default to 28 days
  const [viewType, setViewType] = useState('overview'); // overview, trends, breakdown

  // Helper function to convert any date to Indian timezone
  const toIndianTime = (dateInput) => {
    try {
      let date;
      if (typeof dateInput === 'string') {
        // If it's a date string in YYYY-MM-DD format (from backend), treat as UTC date
        if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
          date = new Date(dateInput + 'T00:00:00.000Z');
        } else {
          date = new Date(dateInput);
        }
      } else {
        date = new Date(dateInput);
      }
      
      if (isNaN(date.getTime())) return new Date();
      
      // Convert to Indian timezone (UTC+5:30)
      const indianTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      return indianTime;
    } catch (error) {
      console.error('Error converting to Indian time:', error);
      return new Date();
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedDays]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyticsService.getAnalytics(selectedDays);
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDayOptions = () => [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 28, label: 'Last 28 days' },
    { value: 56, label: 'Last 56 days' },
    { value: 90, label: 'Last 3 months' },
    { value: 180, label: 'Last 6 months' },
    { value: 365, label: 'Last year' }
  ];

  const getCompletionTrend = () => {
    if (!analytics?.dailyStats?.length) return 'stable';
    
    const recent = analytics.dailyStats.slice(0, Math.min(7, analytics.dailyStats.length));
    const older = analytics.dailyStats.slice(7, Math.min(14, analytics.dailyStats.length));
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, day) => sum + day.completionRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, day) => sum + day.completionRate, 0) / older.length;
    
    if (recentAvg > olderAvg + 10) return 'improving';
    if (recentAvg < olderAvg - 10) return 'declining';
    return 'stable';
  };

  const getBestDay = () => {
    if (!analytics?.dailyStats?.length) return null;
    
    // Find the day with the highest completion rate
    const bestDay = analytics.dailyStats.reduce((best, day) => 
      day.completionRate > (best?.completionRate || 0) ? day : best
    );
    
    // If all days have 0% completion rate, return today's date
    bestDay.completionRate = analytics.completionRate;
    
    return bestDay;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '';
      const indianDate = toIndianTime(dateString);
      const day = indianDate.getUTCDate();
      const month = indianDate.getUTCMonth() + 1;
      
      return `${day}/${month}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || '';
    }
  };

  const formatDateForTrends = (dateString) => {
    try {
      if (!dateString) return { short: '', full: '' };
      const indianDate = toIndianTime(dateString);
      const day = indianDate.getUTCDate();
      const month = indianDate.getUTCMonth() + 1;
      const year = indianDate.getUTCFullYear();
      const dayOfWeek = indianDate.getUTCDay();
      
      // Indian month names
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      return {
        short: `${day}/${month}`,
        full: `${weekdays[dayOfWeek]}, ${day} ${monthNames[month-1]} ${year}`
      };
    } catch (error) {
      console.error('Error formatting date for trends:', error);
      return { short: dateString || '', full: dateString || '' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const trend = getCompletionTrend();
  const bestDay = getBestDay();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your task completion patterns and productivity insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Period
              </label>
              <select
                value={selectedDays}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="input-field w-40"
              >
                {getDayOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {['overview', 'trends', 'breakdown'].map(type => (
              <button
                key={type}
                onClick={() => setViewType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        {viewType === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTarget className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {analytics?.totalTasks || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiCheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completed
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {analytics?.completedTasks || 0}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiBarChart className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Completion Rate
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {analytics?.completionRate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrendingUp className={`h-8 w-8 ${
                    trend === 'improving' ? 'text-success-600' :
                    trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Trend
                  </p>
                  <p className={`text-2xl font-semibold ${
                    trend === 'improving' ? 'text-success-600' :
                    trend === 'declining' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  }`}>
                    {trend.charAt(0).toUpperCase() + trend.slice(1)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Priority Breakdown */}
        {(viewType === 'overview' || viewType === 'breakdown') && analytics?.priorityBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Task Priority Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['high', 'medium', 'low'].map(priority => {
                const data = analytics.priorityBreakdown[priority] || { total: 0, completed: 0 };
                const rate = data.total > 0 ? (data.completed / data.total * 100) : 0;
                
                return (
                  <div key={priority} className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${
                      priority === 'high' ? 'text-red-600' :
                      priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {rate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {data.completed}/{data.total} completed
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${
                          priority === 'high' ? 'bg-red-600' :
                          priority === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Daily Trends */}
        {(viewType === 'trends' || viewType === 'overview') && analytics?.dailyStats?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Daily Completion Trends
            </h3>
            
            {/* Best Day Highlight */}
            {bestDay && (
              <div className={`rounded-lg p-4 mb-6 ${
                bestDay.completionRate > 0 
                  ? 'bg-success-50 dark:bg-success-900/20' 
                  : 'bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-center">
                  <FiCalendar className={`h-5 w-5 mr-2 ${
                    bestDay.completionRate > 0 
                      ? 'text-success-600' 
                      : 'text-blue-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    bestDay.completionRate > 0 
                      ? 'text-success-800 dark:text-success-200' 
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {bestDay.completionRate > 0 
                      ? `Best Day: ${formatDate(bestDay.date)} - ${bestDay.completionRate.toFixed(1)}% completion rate`
                      : `Today: ${formatDate(bestDay.date)} - Ready to start completing tasks!`
                    }
                  </span>
                </div>
              </div>
            )}

            {viewType === 'trends' && analytics?.dailyStats?.length > 0 ? (
              /* Task-wise Trends View - Full Width */
              <div className="w-full">
                {/* Day-wise Completion Grid */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Daily Completion Status ({analytics.dailyStats.length} days)
                    </h4>
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      Scroll horizontally → to see all days
                    </div>
                  </div>
                  
                  {/* Scrollable container with shadow indicators */}
                  <div className="relative">
                    <div className="overflow-x-auto pb-2 horizontal-scroll scroll-smooth" 
                         style={{ scrollBehavior: 'smooth' }}>
                      <div className="w-full">
                        {/* Date Headers */}
                        <div className="flex gap-1 mb-2">
                          <div className="w-36 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Task
                          </div>
                          {[...analytics.dailyStats].reverse().map((day, index) => {
                            const dateInfo = formatDateForTrends(day.date);
                            const dayNum = dateInfo.short.split('/')[0];
                            const monthNum = dateInfo.short.split('/')[1];
                            const isFirstOfMonth = dayNum === '0';
                            
                            return (
                              <div 
                                key={day.date} 
                                className="w-8 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 text-center font-medium"
                              >
                                {isFirstOfMonth ? `${dayNum}/${monthNum}` : dayNum}
                              </div>
                            );
                          })}
                        </div>

                        {/* Task Completion Grid */}
                        <div className="space-y-2">
                          {analytics.tasks && analytics.tasks.length > 0 ? (
                            analytics.tasks.map((task, index) => (
                              <div key={task._id} className="flex gap-1 items-center">
                                <div className={`w-36 flex-shrink-0 text-sm font-medium truncate px-3 py-2 rounded-lg border-l-4 ${
                                  task.priority === 'high' 
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-red-500'
                                    : task.priority === 'medium'
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-l-yellow-500'
                                    : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-green-500'
                                }`}>
                                  {task.title}
                                </div>
                                {[...analytics.dailyStats].reverse().map((day) => {
                                  const taskProgress = analytics.taskProgressByDate?.[task._id]?.[day.date];
                                  const isCompleted = taskProgress?.completed;
                                  
                                  return (
                                    <div
                                      key={`${task._id}-${day.date}`}
                                      className={`w-8 h-8 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors hover:scale-110 ${
                                        isCompleted
                                          ? 'bg-success-500 border-success-600 hover:bg-success-600'
                                          : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      {isCompleted && (
                                        <FiCheckCircle className="w-4 h-4 text-white" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ))
                          ) : (
                            <div className="flex gap-1 items-center">
                              <div className="w-48 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 pr-2">
                                No tasks
                              </div>
                              {[...analytics.dailyStats].reverse().map((day) => (
                                <div
                                  key={`no-task-${day.date}`}
                                  className="w-8 h-8 flex-shrink-0 rounded border-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                >
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-success-500 rounded border"></div>
                        <span>Completed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-600 rounded border"></div>
                        <span>Not Completed</span>
                      </div>
                    </div>
                    <span>Showing all {analytics.dailyStats.length} days - Scroll horizontally to see more</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simple Bar Chart for Overview */
              <div className="space-y-3">
                {[...analytics.dailyStats].reverse().map((day, index) => (
                  <div key={day.date} className="flex items-center">
                    <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                          <div
                            className="bg-gradient-to-r from-primary-600 to-primary-500 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${day.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white min-w-[3rem]">
                          {day.completionRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {day.completed}/{day.total}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* No Data State */}
        {(!analytics || analytics.totalTasks === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-12"
          >
            <FiBarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analytics Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Start creating and completing tasks to see your productivity analytics. 
              Your progress will be tracked up to 365 days.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary"
            >
              Create Your First Task
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
