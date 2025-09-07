import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiEye
} from 'react-icons/fi';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import { taskService } from '../services/taskService';

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
const TaskDetailModal = ({ task, isOpen, onClose }) => {
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
                  task.completed
                    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900'
                    : 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
                }`}>
                  {task.completed ? (
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
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
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
  const { tasks, loading, createTask, deleteTask, updateTask, toggleTask } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskToView, setTaskToView] = useState(null);
  const [todayProgress, setTodayProgress] = useState([]);

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

  const handleTaskToggle = async (taskId) => {
    try {
      // Optimistic update - instantly update UI
      const currentCompleted = isTaskCompleted(taskId);
      
      if (currentCompleted) {
        // Remove from completed tasks instantly
        setTodayProgress(prev => prev.filter(progress => progress.task._id !== taskId));
      } else {
        // Add to completed tasks instantly
        const task = tasks.find(t => t._id === taskId);
        if (task) {
          setTodayProgress(prev => [...prev, { 
            task: task, 
            completed: true, 
            completedAt: new Date().toISOString() 
          }]);
        }
      }
      
      // Then update the backend in the background
      await toggleTask(taskId);
    } catch (error) {
      console.error('Error toggling task:', error);
      // If API call fails, revert the optimistic update
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Task</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900">
                <FiCheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Today's Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.completedTasks}/{todayStats.totalTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-warning-100 dark:bg-warning-900">
                <FiClock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.pendingTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-success-100 dark:bg-success-900">
                <FiTrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.completionRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-secondary-100 dark:bg-secondary-700">
                <FiTarget className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.totalTasks}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Tasks
          </h2>
          
          {tasks.length === 0 ? (
            <div className="card text-center py-12">
              <FiTarget className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Create your first task to start tracking your daily progress
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn flex items-center justify-center mx-auto btn-primary"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  isCompleted={isTaskCompleted(task._id)}
                  onToggle={handleTaskToggle}
                  onEdit={() => setSelectedTask(task)}
                  onDelete={() => deleteTask(task._id)}
                  onView={handleViewTask}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createTask}
        />

        {/* Edit Task Modal */}
        {selectedTask && (
          <EditTaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onSubmit={updateTask}
          />
        )}

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={taskToView}
          isOpen={showTaskModal}
          onClose={handleCloseTaskModal}
        />
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, isCompleted, onToggle, onEdit, onDelete, onView }) => {
  const displayTitle = truncateText(task.title, TEXT_LIMITS.TITLE);
  const displayDescription = truncateText(task.description, TEXT_LIMITS.DESCRIPTION);

  return (
    <div
      className="card hover:shadow-lg transition-shadow duration-200 overflow-hidden"
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
          <button
            onClick={() => onView(task)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="View full details"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="Edit task"
          >
            <FiEdit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-100 dark:bg-gray-700 rounded"
            title="Delete task"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggle(task._id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isCompleted
              ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isCompleted
              ? 'bg-success-600 border-success-600 text-white'
              : 'border-gray-300 dark:border-gray-600'
          }`}>
            {isCompleted && <FiCheck className="w-3 h-3" />}
          </div>
          <span className="text-sm font-medium">
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </span>
        </button>

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
    </div>
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

export default Dashboard;
