import api from './api';

class SettingsService {
  async getUserSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      throw error;
    }
  }

  async updateSettings(settings) {
    try {
      const response = await api.put('/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  async updateSpecificSetting(setting, value) {
    try {
      const response = await api.patch('/settings/update', { setting, value });
      return response.data;
    } catch (error) {
      console.error('Failed to update specific setting:', error);
      throw error;
    }
  }

  async resetSettings() {
    try {
      const response = await api.post('/settings/reset');
      return response.data;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  async toggleFocusMode() {
    try {
      const response = await api.post('/settings/toggle-focus');
      return response.data;
    } catch (error) {
      console.error('Failed to toggle focus mode:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
