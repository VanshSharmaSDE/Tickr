import api from './api';

interface Settings {
  theme: 'light' | 'dark';
  taskViewMode: 'card' | 'list';
  notifications: boolean;
  language: string;
  animation: boolean;
}

export const settingsService = {
  // Get user settings
  getUserSettings: async (): Promise<Settings> => {
    const response = await api.get<Settings>('/settings');
    return response.data;
  },

  // Update user settings
  updateUserSettings: (settings: Settings) => {
    return api.put<{ message: string }>('/settings', settings);
  },

  // Update specific setting
  updateSetting: (key: keyof Settings, value: any) => {
    return api.patch<{ message: string }>('/settings', { [key]: value });
  },

  // Reset settings to default
  resetSettings: () => {
    return api.delete<{ message: string }>('/settings');
  },
};