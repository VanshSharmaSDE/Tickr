import api from './api';

class FocusService {
  // Get focus mode status and tasks
  async getFocusMode() {
    try {
      console.log('FocusService: Making request to /focus');
      const response = await api.get('/focus');
      console.log('FocusService: Response received:', response);
      console.log('FocusService: Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('FocusService: Failed to get focus mode:', error);
      console.error('FocusService: Error response:', error.response?.data);
      console.error('FocusService: Error status:', error.response?.status);
      
      // Return safe defaults instead of throwing error to prevent app crashes
      return {
        isEnabled: false,
        tasks: [],
        totalTasks: 0
      };
    }
  }

  // Enable focus mode (clears existing focus entries)
  async enableFocusMode() {
    try {
      const response = await api.post('/focus/enable');
      return response.data;
    } catch (error) {
      console.error('Failed to enable focus mode:', error);
      throw error;
    }
  }

  // Disable focus mode (clears all focus entries)
  async disableFocusMode() {
    try {
      const response = await api.post('/focus/disable');
      return response.data;
    } catch (error) {
      console.error('Failed to disable focus mode:', error);
      throw error;
    }
  }

  // Get available tasks to add to focus mode
  async getAvailableTasks() {
    try {
      const response = await api.get('/focus/available');
      return response.data;
    } catch (error) {
      console.error('Failed to get available tasks:', error);
      throw error;
    }
  }

  // Add existing task to focus mode by task ID
  async addFocusTask(taskId) {
    try {
      const response = await api.post('/focus/tasks', { taskId });
      return response.data;
    } catch (error) {
      console.error('Failed to add focus task:', error);
      throw error;
    }
  }

  // Remove task from focus mode by focus entry ID
  async removeFocusTask(focusId) {
    try {
      const response = await api.delete(`/focus/tasks/${focusId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove focus task:', error);
      throw error;
    }
  }

  // Reorder focus tasks
  async reorderFocusTasks(focusOrders) {
    try {
      const response = await api.put('/focus/reorder', { focusOrders });
      return response.data;
    } catch (error) {
      console.error('Failed to reorder focus tasks:', error);
      throw error;
    }
  }

  // Add multiple tasks to focus mode (for modal selection)
  async addTasksToFocus(taskIds) {
    try {
      const addPromises = taskIds.map(taskId => this.addFocusTask(taskId));
      const results = await Promise.all(addPromises);
      
      return {
        success: true,
        message: `${taskIds.length} tasks added to focus mode`,
        results: results
      };
    } catch (error) {
      console.error('Failed to add tasks to focus:', error);
      throw error;
    }
  }
}

export const focusService = new FocusService();
export default focusService;