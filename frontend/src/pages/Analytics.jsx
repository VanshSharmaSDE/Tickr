import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBarChart, 
  FiCalendar, 
  FiCheckCircle,
  FiChevronDown
} from 'react-icons/fi';
import { analyticsService } from '../services/analyticsService';
import { useSettings } from '../context/SettingsContext';

const Analytics = () => {
  const { animationsEnabled } = useSettings();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDays, setSelectedDays] = useState(28); // Default to 28 days
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to conditionally apply animation props
  const getAnimationProps = (animationConfig = {}) => {
    if (!animationsEnabled) {
      return {}; // Return empty object to disable animations
    }
    return animationConfig; // Return the full animation config
  };

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
    { value: 28, label: 'Last 28 days' },
    { value: 56, label: 'Last 56 days' },
    { value: 90, label: 'Last 3 months' },
    { value: 180, label: 'Last 6 months' },
    { value: 365, label: 'Last year' }
  ];

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
      if (!dateString) return '';
      const indianDate = toIndianTime(dateString);
      const day = indianDate.getUTCDate();
      const month = indianDate.getUTCMonth() + 1;
      
      return `${day}/${month}`;
    } catch (error) {
      console.error('Error formatting date for trends:', error);
      return dateString || '';
    }
  };

  const getCurrentYear = () => {
    if (!analytics?.dailyStats?.length) return '';
    const latestDate = analytics.dailyStats[analytics.dailyStats.length - 1]?.date;
    if (!latestDate) return '';
    
    try {
      const indianDate = toIndianTime(latestDate);
      return indianDate.getUTCFullYear();
    } catch (error) {
      return new Date().getFullYear();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="analytics-dashboard">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your task completion patterns and productivity insights
          </p>
        </div>

        {/* Controls - Only show when there are tasks */}
        {analytics && analytics.totalTasks > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time Period
                </label>
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`input-field w-40 cursor-pointer appearance-none text-left flex items-center justify-between ${
                      isDropdownOpen ? 'border-white ring-2 ring-white' : ''
                    }`}
                  >
                    <span>{getDayOptions().find(option => option.value === selectedDays)?.label}</span>
                    <motion.div
                      {...getAnimationProps({
                        animate: { rotate: isDropdownOpen ? 180 : 0 },
                        transition: { duration: 0.3 }
                      })}
                    >
                      <FiChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10"
                        {...getAnimationProps({
                          initial: { opacity: 0, y: -10, scale: 0.95 },
                          animate: { opacity: 1, y: 0, scale: 1 },
                          exit: { opacity: 0, y: -10, scale: 0.95 },
                          transition: { duration: 0.2 }
                        })}
                      >
                        {getDayOptions().map((option, index) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSelectedDays(option.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ${
                              selectedDays === option.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
                            } ${index === 0 ? 'rounded-t-lg' : ''} ${index === getDayOptions().length - 1 ? 'rounded-b-lg' : ''}`}
                            {...getAnimationProps({
                              initial: { opacity: 0, x: -10 },
                              animate: { opacity: 1, x: 0 },
                              transition: { delay: index * 0.05, duration: 0.2 }
                            })}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Content - Only show when there are tasks */}
        {analytics && analytics.totalTasks > 0 && (
          <>
            {/* Daily Trends */}
            {analytics?.dailyStats?.length > 0 && (
              <motion.div
                {...getAnimationProps({
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                })}
                className="card mb-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Daily Completion Trends
                </h3>
            
            {/* Task-wise Trends View - Full Width */}
              <div className="w-full">
                {/* Day-wise Completion Grid */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Daily Completion Status ({analytics.dailyStats.length} days) - {getCurrentYear()}
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
                          <motion.div 
                            {...getAnimationProps({
                              initial: { opacity: 0, x: -20 },
                              animate: { opacity: 1, x: 0 },
                              transition: { duration: 0.3 }
                            })}
                            className="w-36 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 font-medium"
                          >
                            Task
                          </motion.div>
                          {[...analytics.dailyStats].reverse().map((day, index) => {
                            const dateStr = formatDateForTrends(day.date);
                            
                            return (
                              <motion.div 
                                key={day.date}
                                {...getAnimationProps({
                                  initial: { opacity: 0, y: -10 },
                                  animate: { opacity: 1, y: 0 },
                                  transition: { 
                                    duration: 0.3,
                                    delay: index * 0.02,
                                    ease: "easeOut"
                                  }
                                })}
                                className="w-8 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400 text-center font-medium"
                              >
                                {dateStr}
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Task Completion Grid */}
                        <div className="space-y-2">
                          {analytics.tasks && analytics.tasks.length > 0 ? (
                            analytics.tasks.map((task, taskIndex) => (
                              <motion.div 
                                key={task._id} 
                                {...getAnimationProps({
                                  initial: { opacity: 0, x: -30 },
                                  animate: { opacity: 1, x: 0 },
                                  transition: { 
                                    duration: 0.4,
                                    delay: taskIndex * 0.1,
                                    ease: "easeOut"
                                  }
                                })}
                                className="flex gap-1 items-center"
                              >
                                <motion.div 
                                  {...getAnimationProps({
                                    initial: { opacity: 0, scale: 0.8 },
                                    animate: { opacity: 1, scale: 1 },
                                    transition: { 
                                      duration: 0.3,
                                      delay: taskIndex * 0.1 + 0.2,
                                      ease: "easeOut"
                                    }
                                  })}
                                  className={`w-36 flex-shrink-0 text-sm font-medium truncate px-3 py-2 rounded-lg border-l-4 ${
                                    task.priority === 'high' 
                                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-l-red-500'
                                      : task.priority === 'medium'
                                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-l-yellow-500'
                                      : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-green-500'
                                  }`}
                                >
                                  {task.title}
                                </motion.div>
                                {[...analytics.dailyStats].reverse().map((day, dayIndex) => {
                                  const taskProgress = analytics.taskProgressByDate?.[task._id]?.[day.date];
                                  const isCompleted = taskProgress?.completed;
                                  
                                    return (
                                    <motion.div
                                      key={`${task._id}-${day.date}`}
                                      {...getAnimationProps({
                                      initial: { opacity: 0, scale: 0.3, rotateZ: 180 },
                                      animate: { opacity: 1, scale: 1, rotateZ: 0 },
                                      transition: { 
                                        duration: 0.4,
                                        delay: taskIndex * 0.1 + dayIndex * 0.015 + 0.3,
                                        ease: "easeOut",
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                      },
                                      whileHover: { 
                                        scale: 1.15,
                                        rotateZ: 5,
                                        transition: { duration: 0.2 }
                                      }
                                      })}
                                      className={`w-8 h-8 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                      isCompleted
                                        ? 'bg-success-500 border-success-600 hover:bg-success-600 shadow-sm'
                                        : 'bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:bg-gray-300 dark:hover:bg-gray-500'
                                      }`}
                                    >
                                      {isCompleted && (
                                      <motion.div
                                        {...getAnimationProps({
                                        initial: { opacity: 0, scale: 0 },
                                        animate: { opacity: 1, scale: 1 },
                                        transition: { 
                                          duration: 0.3,
                                          delay: taskIndex * 0.1 + dayIndex * 0.015 + 0.5,
                                          ease: "easeOut"
                                        }
                                        })}
                                      >
                                        <FiCheckCircle className="w-4 h-4 text-white" />
                                      </motion.div>
                                      )}
                                    </motion.div>
                                    );
                                })}
                              </motion.div>
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
          </motion.div>
        )}
        </>
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
