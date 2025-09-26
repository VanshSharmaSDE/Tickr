import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiClock, FiTarget } from 'react-icons/fi';
import { useTasks } from '../hooks/useTasks';

const FocusModeModal = ({ isOpen, onClose, onStartFocus }) => {
  const { tasks, loading } = useTasks();
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => {
    const normalizedTitle = task.title?.toLowerCase() ?? '';
    const normalizedDescription = task.description?.toLowerCase() ?? '';
    const normalizedSearch = searchTerm.toLowerCase();

    return (
      normalizedTitle.includes(normalizedSearch) ||
      normalizedDescription.includes(normalizedSearch)
    );
  });

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleStartFocus = async () => {
    if (selectedTasks.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Pass the selected task IDs directly to onStartFocus
      await onStartFocus(selectedTasks);
    } catch (err) {
      const status = err?.response?.status;
      const responseMessage = err?.response?.data?.message || err?.response?.data?.error;

      if (status === 400) {
        setError(
          responseMessage
            ? `Bad request: ${responseMessage}`
            : 'Bad request: please review your task selection and try again.'
        );
      } else if (responseMessage) {
        setError(responseMessage);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Something went wrong while starting focus mode. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTasks([]);
    setSearchTerm('');
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FiTarget className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Focus Mode
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select tasks to focus on
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {error && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No tasks found matching your search' : 'No tasks available'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleTaskToggle(task._id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTasks.includes(task._id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedTasks.includes(task._id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedTasks.includes(task._id) && (
                        <FiCheck className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {task.priority} priority
                        </span>
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-3 h-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStartFocus}
                disabled={selectedTasks.length === 0 || isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiTarget className="w-4 h-4" />
                <span>{isSubmitting ? 'Starting...' : 'Start Focus Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusModeModal;