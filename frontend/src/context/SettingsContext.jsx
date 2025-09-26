import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import toast from 'react-hot-toast';

const SettingsContext = createContext();

const STORAGE_KEY = 'userSettings';

const defaultSettings = {
  theme: 'light',
  taskViewMode: 'card',
  notifications: true,
  language: 'en',
  animation: true,
  focusMode: false
};

const normalizeSettings = (incoming = {}) => {
  const focusModeValue =
    typeof incoming.focusMode === 'boolean'
      ? incoming.focusMode
      : typeof incoming.focusmode === 'boolean'
        ? incoming.focusmode
        : defaultSettings.focusMode;

  const normalized = {
    ...defaultSettings,
    ...incoming,
    focusMode: focusModeValue
  };

  delete normalized.focusmode;
  delete normalized.focus_mode;

  return normalized;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ ...defaultSettings });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load settings from backend on mount
  useEffect(() => {
    // TEMPORARY: Disable settings loading to prevent infinite reloads
    console.log('SettingsContext: Skipping settings load to prevent reloads');
    setSettings({ ...defaultSettings });
    setLoading(false);
    return;
    
    // Original code (commented out):
    // loadUserSettings();
  }, []);

  // Listen for auth state changes to reload settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        // User logged in, reload settings
        loadUserSettings();
      } else if (e.key === 'token' && !e.newValue) {
        // User logged out, reset to defaults
        setSettings({ ...defaultSettings });
        localStorage.removeItem(STORAGE_KEY);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for custom userLogin event to reload settings
  useEffect(() => {
    let timeoutId;
    
    const handleUserLogin = () => {
      // Debounce the settings reload to prevent rapid successive calls
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('User login event received, reloading settings...');
        loadUserSettings();
      }, 100);
    };

    window.addEventListener('userLogin', handleUserLogin);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('userLogin', handleUserLogin);
    };
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
    // Prevent multiple simultaneous loads
    if (loading) {
      console.log('Settings already loading, skipping...');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        // User not authenticated, use defaults
        const normalizedDefaults = { ...defaultSettings };
        setSettings(normalizedDefaults);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedDefaults));
        return;
      }
      
      // Try to get from localStorage first for instant UI update
      const localSettings = localStorage.getItem(STORAGE_KEY);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          const normalizedLocal = normalizeSettings(parsed);
          setSettings(normalizedLocal);
        } catch (parseError) {
          console.error('Failed to parse local settings:', parseError);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      // Then fetch from backend to ensure sync
      const backendSettings = await settingsService.getUserSettings();
      const normalizedBackend = normalizeSettings(backendSettings);

      setSettings(normalizedBackend);

      // Update localStorage with latest backend data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedBackend));
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep using localStorage settings if backend fails
      const localSettings = localStorage.getItem(STORAGE_KEY);
      if (localSettings) {
        try {
          const parsed = JSON.parse(localSettings);
          const normalizedLocal = normalizeSettings(parsed);
          setSettings(normalizedLocal);
        } catch (parseError) {
          console.error('Failed to parse local settings:', parseError);
          localStorage.removeItem(STORAGE_KEY);
          setSettings({ ...defaultSettings });
        }
      } else {
        // No local settings, use defaults
        setSettings({ ...defaultSettings });
      }
      // Don't show error toast on initial load failure
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value) => {
    const previousSettings = { ...settings };
    try {
      // Optimistic update for instant UI response
      const optimisticSettings = normalizeSettings({ ...settings, [key]: value });
      setSettings(optimisticSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(optimisticSettings));

      // Show success toast based on setting type
      const settingMessages = {
        theme: `Theme changed to ${value}`,
        taskViewMode: `View mode changed to ${value}`,
        animation: `Animations ${value ? 'enabled' : 'disabled'}`,
        notifications: `Notifications ${value ? 'enabled' : 'disabled'}`,
        language: `Language changed to ${typeof value === 'string' ? value.toUpperCase() : value}`
      };

      const message = settingMessages[key] || 'Setting updated successfully';
      toast.success(message);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        // User not authenticated, just save locally
        return;
      }

      // Background API call for authenticated users
      setSyncing(true);
      const updatedSettings = await settingsService.updateSpecificSetting(key, value);
      const normalizedServerSettings = normalizeSettings(updatedSettings);

      // Update with server response
      setSettings(normalizedServerSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedServerSettings));
      
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Revert optimistic update on failure
      const normalizedPrevious = normalizeSettings(previousSettings);
      setSettings(normalizedPrevious);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPrevious));
      toast.error('Failed to save setting. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const updateMultipleSettings = async (newSettings) => {
    const previousSettings = { ...settings };
    try {
      // Optimistic update
      const optimisticSettings = normalizeSettings({ ...settings, ...newSettings });
      setSettings(optimisticSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(optimisticSettings));

      // Show success toast
      const settingCount = Object.keys(newSettings).length;
      toast.success(`${settingCount} setting${settingCount > 1 ? 's' : ''} updated successfully`);

      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Background API call
      setSyncing(true);
      const serverSettings = await settingsService.updateSettings(newSettings);
      
      // Update with server response
      const normalizedServerSettings = normalizeSettings(serverSettings);
      setSettings(normalizedServerSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedServerSettings));
      
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert optimistic update on failure
      const normalizedPrevious = normalizeSettings(previousSettings);
      setSettings(normalizedPrevious);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPrevious));
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const resetSettings = async () => {
    try {
      setSyncing(true);
      const serverDefaults = await settingsService.resetSettings();
      const normalizedDefaults = normalizeSettings(serverDefaults);
      setSettings(normalizedDefaults);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedDefaults));
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

  // Focus mode methods
  const toggleFocusMode = async (silent = false) => {
    const previousSettings = { ...settings };
    const desiredFocusMode = !settings.focusMode;
    const optimisticSettings = normalizeSettings({ ...settings, focusMode: desiredFocusMode });

    setSettings(optimisticSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optimisticSettings));

    const token = localStorage.getItem('token');
    if (!token) {
      if (!silent) {
        toast.success(`Focus mode ${desiredFocusMode ? 'enabled' : 'disabled'} (saved locally)`);
      }
      return desiredFocusMode;
    }

    try {
      setSyncing(true);
      const response = await settingsService.toggleFocusMode();

      const responseSettings = response?.settings
        ? normalizeSettings(response.settings)
        : optimisticSettings;

      const responseFocusMode =
        typeof response?.focusMode === 'boolean'
          ? response.focusMode
          : typeof response?.focusmode === 'boolean'
            ? response.focusmode
            : responseSettings.focusMode;

      const finalSettings = {
        ...responseSettings,
        focusMode: responseFocusMode
      };

      setSettings(finalSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalSettings));

      if (!silent) {
        toast.success(response?.message || `Focus mode ${finalSettings.focusMode ? 'enabled' : 'disabled'}`);
      }
      return finalSettings.focusMode;
    } catch (error) {
      console.error('Failed to toggle focus mode:', error);
      const normalizedPrevious = normalizeSettings(previousSettings);
      setSettings(normalizedPrevious);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedPrevious));

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to toggle focus mode. Please try again.';

      if (!silent) {
        toast.error(errorMessage);
      }
      return previousSettings.focusMode;
    } finally {
      setSyncing(false);
    }
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
    
    // Focus mode methods
    focusMode: settings.focusMode,
    toggleFocusMode,
    
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
