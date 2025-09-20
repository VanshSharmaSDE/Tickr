import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { settingsService } from '../services/settingsService';

interface Settings {
  theme: 'light' | 'dark';
  taskViewMode: 'card' | 'list';
  notifications: boolean;
  language: string;
  animation: boolean;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  syncing: boolean;
  updateSetting: (key: keyof Settings, value: any) => Promise<void>;
  toggleTheme: () => Promise<void>;
  toggleTaskViewMode: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  toggleAnimation: () => Promise<void>;
  syncSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    taskViewMode: 'card',
    notifications: true,
    language: 'en',
    animation: true
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  // Listen for auth state changes to reload settings
  useEffect(() => {
    const checkAuthState = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // User logged in, reload settings
        loadUserSettings();
      } else {
        // User logged out, reset to defaults
        setSettings({
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true
        });
        await AsyncStorage.removeItem('userSettings');
      }
    };

    // Check periodically for auth changes (simple polling approach for React Native)
    const interval = setInterval(checkAuthState, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // User not authenticated, use defaults
        const defaultSettings: Settings = {
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true
        };
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }
      
      // Try to get from AsyncStorage first for instant UI update
      const localSettings = await AsyncStorage.getItem('userSettings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        // Ensure all required fields exist (migration for existing users)
        const migratedSettings: Settings = {
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true,
          ...parsed // Override with existing saved values
        };
        setSettings(migratedSettings);
      }

      // Then fetch from backend to ensure sync
      const backendSettings = await settingsService.getUserSettings();
      
      // Ensure backend settings have all required fields
      const completeBackendSettings: Settings = {
        theme: 'light',
        taskViewMode: 'card',
        notifications: true,
        language: 'en',
        animation: true,
        ...backendSettings // Override with backend values
      };
      
      setSettings(completeBackendSettings);
      
      // Update AsyncStorage with latest backend data
      await AsyncStorage.setItem('userSettings', JSON.stringify(completeBackendSettings));
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep using local settings if backend fails
      const localSettings = await AsyncStorage.getItem('userSettings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        const migratedSettings: Settings = {
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true,
          ...parsed
        };
        setSettings(migratedSettings);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof Settings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Save to local storage immediately
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      
      // Check if user is authenticated before syncing to backend
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setSyncing(true);
        try {
          await settingsService.updateUserSettings(newSettings);
        } catch (error) {
          console.error('Failed to sync setting to backend:', error);
          Toast.show({
            type: 'error',
            text1: 'Sync Failed',
            text2: 'Settings saved locally but failed to sync to server',
          });
        } finally {
          setSyncing(false);
        }
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Failed to update setting',
      });
    }
  };

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    await updateSetting('theme', newTheme);
  };

  const toggleTaskViewMode = async () => {
    const newMode = settings.taskViewMode === 'card' ? 'list' : 'card';
    await updateSetting('taskViewMode', newMode);
  };

  const toggleNotifications = async () => {
    await updateSetting('notifications', !settings.notifications);
  };

  const toggleAnimation = async () => {
    await updateSetting('animation', !settings.animation);
  };

  const syncSettings = async () => {
    try {
      setSyncing(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('User not authenticated');
      }

      await settingsService.updateUserSettings(settings);
      
      Toast.show({
        type: 'success',
        text1: 'Settings Synced',
        text2: 'Your settings have been saved to the cloud',
      });
    } catch (error) {
      console.error('Failed to sync settings:', error);
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: 'Failed to sync settings to server',
      });
    } finally {
      setSyncing(false);
    }
  };

  const value: SettingsContextType = {
    settings,
    loading,
    syncing,
    updateSetting,
    toggleTheme,
    toggleTaskViewMode,
    toggleNotifications,
    toggleAnimation,
    syncSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};