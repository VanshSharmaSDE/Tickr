import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiPlus, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp, 
  FiEdit3,
  FiTrash2,
  FiX,
  FiTarget,
  FiCheck,
  FiEye,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useFocusMode } from '../context/FocusModeContext';
import { formatDate } from '../utils/dateUtils';
import { taskService } from '../services/taskService';
import FocusModeModal from '../components/FocusModeModal';

// Text truncation utility
const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Text limits
const TEXT_LIMITS = {
  TITLE: 15,
  DESCRIPTION: 50
};

// Task Detail Modal Component
const TaskDetailModal = ({ task, isOpen, onClose, isCompleted }) => {
  if (!isOpen || !task) return null;

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Task Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white break-words">
                {task.title}
              </p>
            </div>

            {/* Task Description */}
            {task.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-600 dark:text-gray-400 break-words whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {formatPriority(task.priority)}
                </span>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isCompleted
                    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
                    : 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
                }`}>
                  {isCompleted ? (
                    <>
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Completed
                    </>
                  ) : (
                    <>
                      <FiClock className="w-4 h-4 mr-1" />
                      Pending
                    </>
                  )}
                </span>
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created
                </label>
                <p className="text-gray-600 dark:text-gray-400">
                  {formatDate(task.createdAt)}
                </p>
              </div>

              {/* Due Date (if exists) */}
              {task.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </label>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Task ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task ID
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {task._id}
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    isCardView, 
    isListView, 
    loading: settingsLoading, 
    animationsEnabled,
    focusMode,
    toggleFocusMode
  } = useSettings();
  const { isInFocusMode, startFocusMode } = useFocusMode();
  const { tasks, loading, createTask, deleteTask, updateTask, toggleTask } = useTasks();
  const navigate = useNavigate();
  
  // Helper function to conditionally apply animation props
  const getAnimationProps = (animationConfig = {}) => {
    if (!animationsEnabled) {
      return {}; // Return empty object to disable animations
    }
    return animationConfig; // Return the full animation config
  };
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToView, setTaskToView] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [todayProgress, setTodayProgress] = useState([]);

  // Handler to open focus modal from navbar
  const handleOpenFocusModal = () => {
    setIsFocusModalOpen(true);
  };

  // Listen for focus modal open event from navbar
  useEffect(() => {
    const handleOpenFocusModalEvent = () => {
      setIsFocusModalOpen(true);
    };

    window.addEventListener('openFocusModal', handleOpenFocusModalEvent);
    return () => {
      window.removeEventListener('openFocusModal', handleOpenFocusModalEvent);
    };
  }, []);

  // Calculate today's stats
  const todayStats = React.useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = todayProgress.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingTasks = totalTasks - completedTasks;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      pendingTasks
    };
  }, [tasks, todayProgress]);

  // Fetch today's progress
  useEffect(() => {
    const fetchTodayProgress = async () => {
      try {
        const response = await taskService.getTodayProgress();
        setTodayProgress(response.data);
      } catch (error) {
        console.error('Failed to fetch today progress:', error);
        setTodayProgress([]);
      }
    };

    fetchTodayProgress();
  }, [tasks]);

  const handleFocusStart = async (selectedTasks) => {
    try {
      // Start focus mode with selected tasks (this will handle backend sync)
      await startFocusMode(selectedTasks);
      setIsFocusModalOpen(false);
      navigate('/focus-mode');
    } catch (error) {
      console.error('Failed to start focus mode:', error);
      toast.error('Failed to start focus mode. Please try again.');
      setIsFocusModalOpen(false);
    }
  };

  const handleFocusCancel = async () => {
    setIsFocusModalOpen(false);
  };

  const handleTaskToggle = async (taskId) => {
    try {
      // Get the task info for better user feedback
      const task = tasks.find(t => t._id === taskId);
      const currentCompleted = isTaskCompleted(taskId);
      
      // Optimistic update - instantly update UI without loader
      if (currentCompleted) {
        // Remove from completed tasks instantly
        setTodayProgress(prev => prev.filter(progress => progress.task._id !== taskId));
        // Show success toast immediately
        toast.success(`✓ ${task?.title ? truncateText(task.title, 20) : 'Task'} unmarked`, {
          duration: 2000,
        });
      } else {
        // Add to completed tasks instantly
        if (task) {
          setTodayProgress(prev => [...prev, { 
            task: task, 
            completed: true, 
            date: new Date(),
            completedAt: new Date().toISOString() 
          }]);
          // Show success toast immediately
          toast.success(`✓ ${truncateText(task.title, 20)} completed!`, {
            duration: 2000,
          });
        }
      }
      
      // Update backend silently in the background
      const result = await toggleTask(taskId);
      
      // Only handle errors if the API call failed
      if (!result.success) {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Error toggling task:', error);
      
      // Show error toast
      toast.error('Failed to update task. Please try again.', {
        duration: 3000,
      });
      
      // Revert the optimistic update on error
      try {
        const response = await taskService.getTodayProgress();
        setTodayProgress(response.data);
      } catch (revertError) {
        console.error('Error reverting state:', revertError);
      }
    }
  };

  const isTaskCompleted = (taskId) => {
    return todayProgress.some(progress => 
      progress.task._id === taskId && progress.completed
    );
  };

  const handleViewTask = (task) => {
    setTaskToView(task);
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setTaskToView(null);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete._id);
      setShowDeleteModal(false);
      setTaskToDelete(null);
      toast.success('Task deleted successfully');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {settingsLoading ? 'Loading your preferences...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.5 }
          })}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Here's your task overview for {formatDate(new Date())}
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center space-x-2 group"
              {...getAnimationProps({
                whileHover: { 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  transition: { duration: 0.2 }
                },
                whileTap: { 
                  scale: 0.98,
                  transition: { duration: 0.1 }
                }
              })}
            >
              <motion.div
                className="group-hover:rotate-90 transition-transform duration-200"
              >
                <FiPlus className="w-5 h-5" />
              </motion.div>
              <span>Create Task</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.2, duration: 0.5 }
          })}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div 
            className="card"
            {...getAnimationProps({
              whileHover: { 
                y: -4,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.98 }
            })}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900"
                {...getAnimationProps({
                  whileHover: { scale: 1.1, rotate: 5 },
                  transition: { duration: 0.2 }
                })}
              >
                <FiCheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Today's Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.completedTasks}/{todayStats.totalTasks}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="card"
            {...getAnimationProps({
              whileHover: { 
                y: -4,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.98 }
            })}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-lg bg-warning-100 dark:bg-warning-900"
                {...getAnimationProps({
                  whileHover: { scale: 1.1, rotate: -5 },
                  transition: { duration: 0.2 }
                })}
              >
                <FiClock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.pendingTasks}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="card"
            {...getAnimationProps({
              whileHover: { 
                y: -4,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.98 }
            })}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-lg bg-success-100 dark:bg-success-900"
                {...getAnimationProps({
                  whileHover: { scale: 1.1, rotate: 10 },
                  transition: { duration: 0.2 }
                })}
              >
                <FiTrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.completionRate}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="card"
            {...getAnimationProps({
              whileHover: { 
                y: -4,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.98 }
            })}
          >
            <div className="flex items-center">
              <motion.div 
                className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-700"
                {...getAnimationProps({
                  whileHover: { scale: 1.1, rotate: -10 },
                  transition: { duration: 0.2 }
                })}
              >
                <FiTarget className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </motion.div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.totalTasks}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          {...getAnimationProps({
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: 0.4, duration: 0.5 }
          })}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Tasks
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              {isCardView ? (
                <>
                  <FiGrid className="w-4 h-4" />
                  <span>Card View</span>
                </>
              ) : (
                <>
                  <FiList className="w-4 h-4" />
                  <span>List View</span>
                </>
              )}
            </div>
          </div>
          
          {tasks.length === 0 ? (
            <div className="card text-center py-12">
              <FiTarget className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first task to start tracking your daily progress
              </p>
              <motion.button
                onClick={() => setShowCreateModal(true)}
                className="btn flex items-center justify-center mx-auto btn-primary group"
                {...getAnimationProps({
                  whileHover: { 
                    scale: 1.05,
                    y: -2,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                    transition: { duration: 0.2 }
                  },
                  whileTap: { 
                    scale: 0.98,
                    y: 0,
                    transition: { duration: 0.1 }
                  }
                })}
              >
                <div className="group-hover:rotate-180 transition-transform duration-300 mr-2">
                  <FiPlus className="w-4 h-4" />
                </div>
                Create Your First Task
              </motion.button>
            </div>
          ) : (
            <motion.div 
              key={isCardView ? 'card-view' : 'list-view'}
              {...getAnimationProps({
                initial: { opacity: 0, y: 10 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.3 }
              })}
              className={isCardView 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-3"
              }
            >
              <AnimatePresence mode="popLayout">
                {tasks.map((task, index) => (
                  isCardView ? (
                    <motion.div
                      key={task._id}
                      {...getAnimationProps({
                        initial: { opacity: 0, scale: 0.9 },
                        animate: { opacity: 1, scale: 1 },
                        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
                        transition: { delay: index * 0.05, duration: 0.3 },
                        layout: true
                      })}
                    >
                      <TaskCard
                        task={task}
                        isCompleted={isTaskCompleted(task._id)}
                        onToggle={handleTaskToggle}
                        onEdit={() => setSelectedTask(task)}
                        onDelete={() => handleDeleteClick(task)}
                        onView={handleViewTask}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={task._id}
                    {...getAnimationProps({
                      initial: { opacity: 0, x: -20 },
                      animate: { opacity: 1, x: 0 },
                      exit: { opacity: 0, x: 20 },
                      transition: { delay: index * 0.03, duration: 0.3 }
                    })}
                  >
                    <TaskListItem
                      task={task}
                      isCompleted={isTaskCompleted(task._id)}
                      onToggle={handleTaskToggle}
                      onEdit={() => setSelectedTask(task)}
                      onDelete={() => handleDeleteClick(task)}
                      onView={handleViewTask}
                    />
                  </motion.div>
                )
              ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

        {/* Focus Mode Modal */}
        <AnimatePresence>
          {isFocusModalOpen && (
            <FocusModeModal
              isOpen={isFocusModalOpen}
              onClose={handleFocusCancel}
              onStartFocus={handleFocusStart}
            />
          )}
        </AnimatePresence>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTaskModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSubmit={createTask}
            />
          )}
        </AnimatePresence>

        {/* Edit Task Modal */}
        <AnimatePresence>
          {selectedTask && (
            <EditTaskModal
              task={selectedTask}
              onClose={() => setSelectedTask(null)}
              onSubmit={updateTask}
            />
          )}
        </AnimatePresence>

        {/* Task Detail Modal */}
        <AnimatePresence>
          {showTaskModal && taskToView && (
            <TaskDetailModal
              task={tasks.find(t => t._id === taskToView._id) || taskToView}
              isOpen={showTaskModal}
              onClose={handleCloseTaskModal}
              isCompleted={isTaskCompleted(taskToView._id)}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && taskToDelete && (
            <DeleteConfirmationModal
              isOpen={showDeleteModal}
              onClose={handleCancelDelete}
              onConfirm={handleConfirmDelete}
              taskTitle={taskToDelete.title}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, isCompleted, onToggle, onEdit, onDelete, onView }) => {
  const { animationsEnabled } = useSettings();
  const displayTitle = truncateText(task.title, TEXT_LIMITS.TITLE);
  const displayDescription = truncateText(task.description, TEXT_LIMITS.DESCRIPTION);

  // Animation helper for this component
  const getCardAnimationProps = (config = {}) => {
    if (!animationsEnabled) return {};
    return config;
  };

  return (
    <motion.div
      className="card hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      {...getCardAnimationProps({
        whileHover: { 
          y: -4,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          transition: { duration: 0.2 }
        },
        whileTap: { scale: 0.98 }
      })}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-2">
          {/* Title Section */}
          <div className="mb-2">
            <h3 className={`text-lg font-semibold break-words overflow-hidden ${
              isCompleted 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {displayTitle}
            </h3>
          </div>
          
          {/* Description Section */}
          {task.description && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-words overflow-hidden">
                {displayDescription}
              </p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 flex-shrink-0">
          <motion.button
            onClick={() => onView(task)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="View full details"
            {...getCardAnimationProps({
              whileHover: { 
                scale: 1.1,
                backgroundColor: "#dbeafe",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.95 }
            })}
          >
            <FiEye className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="Edit task"
            {...getCardAnimationProps({
              whileHover: { 
                scale: 1.1,
                backgroundColor: "#e0e7ff",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.95 }
            })}
          >
            <motion.div
              {...getCardAnimationProps({
                whileHover: { rotate: 15 }
              })}
            >
              <FiEdit3 className="w-4 h-4" />
            </motion.div>
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="Delete task"
            {...getCardAnimationProps({
              whileHover: { 
                scale: 1.1,
                backgroundColor: "#fee2e2",
                transition: { duration: 0.2 }
              },
              whileTap: { scale: 0.95 }
            })}
          >
            <motion.div
              {...getCardAnimationProps({
                whileHover: { rotate: 10, scale: 1.1 }
              })}
            >
              <FiTrash2 className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <motion.button
          onClick={() => onToggle(task._id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isCompleted
              ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900'
          }`}
          {...getCardAnimationProps({
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 },
            initial: { scale: 1 },
            animate: isCompleted ? { 
              scale: [1, 1.05, 1],
              transition: { duration: 0.3 }
            } : { scale: 1 }
          })}
        >
          <motion.div 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isCompleted
                ? 'bg-success-600 border-success-600 text-white'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            {...getCardAnimationProps({
              animate: isCompleted ? {
                scale: [1, 1.2, 1],
                rotate: [0, 360],
                transition: { duration: 0.5 }
              } : { scale: 1, rotate: 0 }
            })}
          >
            <motion.div
              {...getCardAnimationProps({
                initial: { scale: 0, opacity: 0 },
                animate: isCompleted ? { 
                  scale: 1, 
                  opacity: 1,
                  transition: { delay: 0.2, duration: 0.2 }
                } : { scale: 0, opacity: 0 }
              })}
            >
              {isCompleted && <FiCheck className="w-3 h-3" />}
            </motion.div>
          </motion.div>
          <span className="text-sm font-medium">
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </span>
        </motion.button>

        <span className={`text-xs px-2 py-1 rounded-full border ${
          task.priority === 'high'
            ? 'priority-high'
            : task.priority === 'medium'
            ? 'priority-medium'
            : 'priority-low'
        }`}>
          {task.priority}
        </span>
      </div>
    </motion.div>
  );
};

// Task List Item Component (for list view)
const TaskListItem = ({ task, isCompleted, onToggle, onEdit, onDelete, onView }) => {
  const { animationsEnabled } = useSettings();
  
  const getListAnimationProps = (config = {}) => {
    if (!animationsEnabled) return {};
    return config;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
      {...getListAnimationProps({
        whileHover: { 
          scale: 1.01,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          transition: { duration: 0.2 }
        }
      })}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Task info and completion button */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Completion button */}
          <motion.button
            onClick={() => onToggle(task._id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              isCompleted
                ? 'bg-success-600 border-success-600 text-white'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
            }`}
            {...getListAnimationProps({
              whileHover: { scale: 1.1 },
              whileTap: { scale: 0.9 },
              animate: isCompleted ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.3 }
              } : { scale: 1 }
            })}
          >
            <motion.div
              {...getListAnimationProps({
                initial: { scale: 0, rotate: 0 },
                animate: isCompleted ? { 
                  scale: 1, 
                  rotate: 360,
                  transition: { delay: 0.1, duration: 0.3 }
                } : { scale: 0, rotate: 0 }
              })}
            >
              {isCompleted && <FiCheck className="w-3 h-3" />}
            </motion.div>
          </motion.button>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className={`text-base font-medium truncate ${
                isCompleted 
                  ? 'line-through text-gray-500 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>
              
              {/* Priority badge */}
              <span className={`text-xs px-2 py-1 rounded-full border flex-shrink-0 ${
                task.priority === 'high'
                  ? 'priority-high'
                  : task.priority === 'medium'
                  ? 'priority-medium'
                  : 'priority-low'
              }`}>
                {task.priority}
              </span>
            </div>
            
            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <button
            onClick={() => onView(task)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
            title="View full details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
            title="Edit task"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded-lg"
            title="Delete task"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef(null);

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        titleInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    const result = await onSubmit(formData);
    setLoading(false);

    if (result.success) {
      setFormData({
        title: '',
        description: '',
        priority: 'medium'
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Task
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Complete daily workout"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Brief description of your task..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn flex items-center justify-center mx-auto btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

// Edit Task Modal Component
const EditTaskModal = ({ task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority
  });
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef(null);

  // Auto-focus title input when modal opens
  useEffect(() => {
    if (task && titleInputRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        titleInputRef.current.focus();
        titleInputRef.current.select(); // Select all text for easy editing
      }, 100);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    const result = await onSubmit(task._id, formData);
    setLoading(false);

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Task
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="input-field"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <FiTrash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Delete Task
              </h3>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Are you sure you want to delete this task?
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              "{taskTitle}"
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;