import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import toast from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    taskViewMode: 'card',
    notifications: true,
    language: 'en',
    animation: true
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load settings from backend on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  // Listen for auth state changes to reload settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        // User logged in, reload settings
        loadUserSettings();
      } else if (e.key === 'token' && !e.newValue) {
        // User logged out, reset to defaults
        setSettings({
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true
        });
        localStorage.removeItem('userSettings');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set CSS variables for toast styling
    const style = root.style;
    if (settings.theme === 'dark') {
      style.setProperty('--toast-bg', '#374151');
      style.setProperty('--toast-color', '#f9fafb');
      style.setProperty('--toast-border', '#4b5563');
    } else {
      style.setProperty('--toast-bg', '#ffffff');
      style.setProperty('--toast-color', '#111827');
      style.setProperty('--toast-border', '#e5e7eb');
    }
  }, [settings.theme]);

  // Apply animations setting to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (settings.animation) {
      root.classList.remove('animations-disabled');
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    } else {
      root.classList.add('animations-disabled');
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    }
  }, [settings.animation]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        // User not authenticated, use defaults
        const defaultSettings = {
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
      
      // Try to get from localStorage first for instant UI update
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        // Ensure all required fields exist (migration for existing users)
        const migratedSettings = {
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
      const completeBackendSettings = {
        theme: 'light',
        taskViewMode: 'card',
        notifications: true,
        language: 'en',
        animation: true,
        ...backendSettings // Override with backend values
      };
      
      setSettings(completeBackendSettings);
      
      // Update localStorage with latest backend data
      localStorage.setItem('userSettings', JSON.stringify(completeBackendSettings));
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep using localStorage settings if backend fails
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          // Ensure all required fields exist
          const migratedSettings = {
            theme: 'light',
            taskViewMode: 'card',
            notifications: true,
            language: 'en',
            animation: true,
            ...parsed
          };
          setSettings(migratedSettings);
        } catch (parseError) {
          console.error('Failed to parse local settings:', parseError);
          // Use complete defaults if parsing fails
          setSettings({
            theme: 'light',
            taskViewMode: 'card',
            notifications: true,
            language: 'en',
            animation: true
          });
        }
      } else {
        // No local settings, use defaults
        setSettings({
          theme: 'light',
          taskViewMode: 'card',
          notifications: true,
          language: 'en',
          animation: true
        });
      }
      // Don't show error toast on initial load failure
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      // Optimistic update for instant UI response
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      localStorage.setItem('userSettings', JSON.stringify(newSettings));

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        // User not authenticated, just save locally
        return;
      }

      // Background API call for authenticated users
      setSyncing(true);
      const updatedSettings = await settingsService.updateSpecificSetting(key, value);
      
      // Update with server response
      setSettings(updatedSettings);
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert optimistic update on failure
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }
      toast.error('Failed to save setting. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const updateMultipleSettings = async (newSettings) => {
    try {
      // Optimistic update
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('userSettings', JSON.stringify(updatedSettings));

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Background API call
      setSyncing(true);
      const serverSettings = await settingsService.updateSettings(newSettings);
      
      // Update with server response
      setSettings(serverSettings);
      localStorage.setItem('userSettings', JSON.stringify(serverSettings));
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert optimistic update on failure
      const localSettings = localStorage.getItem('userSettings');
      if (localSettings) {
        setSettings(JSON.parse(localSettings));
      }
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const resetSettings = async () => {
    try {
      setSyncing(true);
      const defaultSettings = await settingsService.resetSettings();
      setSettings(defaultSettings);
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
      toast.success('Settings reset to default');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset settings. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  // Theme-specific methods
  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSetting('theme', newTheme);
  };

  // View mode-specific methods
  const toggleViewMode = () => {
    const newViewMode = settings.taskViewMode === 'card' ? 'list' : 'card';
    updateSetting('taskViewMode', newViewMode);
  };

  // Animation-specific methods
  const toggleAnimations = () => {
    const newAnimation = !settings.animation;
    updateSetting('animation', newAnimation);
  };

  const setCardView = () => {
    updateSetting('taskViewMode', 'card');
  };

  const setListView = () => {
    updateSetting('taskViewMode', 'list');
  };

  const value = {
    // Settings state
    settings,
    loading,
    syncing,
    
    // General methods
    updateSetting,
    updateMultipleSettings,
    resetSettings,
    loadUserSettings,
    
    // Theme methods
    toggleTheme,
    isDark: settings.theme === 'dark',
    isLight: settings.theme === 'light',
    
    // View mode methods
    viewMode: settings.taskViewMode,
    isCardView: settings.taskViewMode === 'card',
    isListView: settings.taskViewMode === 'list',
    toggleViewMode,
    setCardView,
    setListView,
    
    // Animation methods
    animationsEnabled: settings.animation,
    toggleAnimations,
    
    // Other settings
    notifications: settings.notifications,
    language: settings.language,
    setNotifications: (value) => updateSetting('notifications', value),
    setLanguage: (value) => updateSetting('language', value)
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
