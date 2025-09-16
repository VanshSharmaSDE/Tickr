import api from './api';

export const analyticsService = {
  // Get analytics with optional days parameter
  getAnalytics: async (days = 7) => {
    try {
      const response = await api.get('/analytics', { 
        params: { days } 
      });
      return response.data;
    } catch (error) {
      console.error('Analytics service error:', error);
      throw error;
    }
  },

  // Get tasks ranked by completion count
  getTaskRankings: async () => {
    try {
      const response = await api.get('/analytics/task-rankings');
      return response.data;
    } catch (error) {
      console.error('Task rankings service error:', error);
      throw error;
    }
  },

};
