import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { 
  FiSettings, 
  FiSun, 
  FiMoon, 
  FiGrid, 
  FiList,
  FiBell,
  FiBellOff,
  FiGlobe,
  FiRefreshCw,
  FiCheck
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const {
    settings,
    syncing,
    toggleTheme,
    toggleViewMode,
    setNotifications,
    resetSettings,
    isDark,
    isCardView,
    notifications,
    language
  } = useSettings();

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      await resetSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <FiSettings className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            {syncing && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin">
                  <FiRefreshCw className="w-4 h-4" />
                </div>
                <span>Syncing...</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your application preferences and customize your experience
          </p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Appearance
            </h2>
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isDark ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Theme
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between light and dark mode
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDark ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDark ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {isCardView ? <FiGrid className="w-5 h-5" /> : <FiList className="w-5 h-5" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Task View Mode
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose between card and list view for tasks
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleViewMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isCardView ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isCardView ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {notifications ? <FiBell className="w-5 h-5" /> : <FiBellOff className="w-5 h-5" />}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive notifications for task reminders and updates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Language & Region
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiGlobe className="w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Language
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently: English (en)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-green-600">
                <FiCheck className="w-4 h-4" />
                <span className="text-sm">Active</span>
              </div>
            </div>
          </motion.div>

          {/* Current Settings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gray-50 dark:bg-gray-800"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Theme:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">{settings.theme}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">View Mode:</span>
                <span className="ml-2 text-gray-900 dark:text-white capitalize">{settings.taskViewMode}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Notifications:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{settings.notifications ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600 dark:text-gray-400">Language:</span>
                <span className="ml-2 text-gray-900 dark:text-white uppercase">{settings.language}</span>
              </div>
            </div>
          </motion.div>

          {/* Reset Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card border-red-200 dark:border-red-800"
          >
            <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">
              Reset Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reset all settings to their default values. This action cannot be undone.
            </p>
            <button
              onClick={handleResetSettings}
              disabled={syncing}
              className="btn bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {syncing ? 'Resetting...' : 'Reset to Defaults'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
