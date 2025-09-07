import api from './api';

export const taskService = {
  // Get all tasks
  getTasks: () => {
    return api.get('/tasks');
  },

  // Get single task
  getTask: (id) => {
    return api.get(`/tasks/${id}`);
  },

  // Create new task
  createTask: (taskData) => {
    return api.post('/tasks', taskData);
  },

  // Update task
  updateTask: (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData);
  },

  // Delete task
  deleteTask: (id) => {
    return api.delete(`/tasks/${id}`);
  },

  // Toggle task completion
  toggleTaskCompletion: (taskId) => {
    return api.post(`/tasks/${taskId}/toggle`);
  },

  // Get today's progress
  getTodayProgress: () => {
    return api.get('/tasks/progress/today');
  },

  // Clean up orphaned progress records
  cleanupOrphanedProgress: () => {
    return api.post('/tasks/cleanup');
  }
};
