const Settings = require('../models/Settings');

// Get user settings
const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let settings = await Settings.findOne({ user: userId });
    
    // If no settings found, create default settings
    if (!settings) {
      settings = new Settings({
        user: userId,
        theme: 'light',
        taskViewMode: 'list',
        notifications: true,
        language: 'en'
      });
      await settings.save();
      console.log('Created default settings for user:', userId);
    }
    
    console.log('Retrieved settings for user:', userId, settings);
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to retrieve settings' });
  }
};

// Update user settings
const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { theme, taskViewMode, notifications, language } = req.body;
    
    // Validate theme if provided
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme. Must be "light" or "dark"' });
    }
    
    // Validate taskViewMode if provided
    if (taskViewMode && !['list', 'card'].includes(taskViewMode)) {
      return res.status(400).json({ message: 'Invalid task view mode. Must be "list" or "card"' });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (theme !== undefined) updateData.theme = theme;
    if (taskViewMode !== undefined) updateData.taskViewMode = taskViewMode;
    if (notifications !== undefined) updateData.notifications = notifications;
    if (language !== undefined) updateData.language = language;
    
    console.log('Updating settings for user:', userId, 'with data:', updateData);
    
    // Find and update settings, or create if doesn't exist
    let settings = await Settings.findOneAndUpdate(
      { user: userId },
      updateData,
      { 
        new: true, 
        upsert: true, // Create if doesn't exist
        runValidators: true 
      }
    );
    
    console.log('Updated settings:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// Update specific setting
const updateSpecificSetting = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { setting, value } = req.body;
    
    // Validate setting name
    const allowedSettings = ['theme', 'taskViewMode', 'notifications', 'language'];
    if (!allowedSettings.includes(setting)) {
      return res.status(400).json({ 
        message: `Invalid setting. Allowed settings: ${allowedSettings.join(', ')}` 
      });
    }
    
    // Validate values based on setting
    if (setting === 'theme' && !['light', 'dark'].includes(value)) {
      return res.status(400).json({ message: 'Invalid theme value' });
    }
    
    if (setting === 'taskViewMode' && !['list', 'card'].includes(value)) {
      return res.status(400).json({ message: 'Invalid task view mode value' });
    }
    
    const updateData = { [setting]: value };
    
    console.log('Updating specific setting for user:', userId, 'setting:', setting, 'value:', value);
    
    let settings = await Settings.findOneAndUpdate(
      { user: userId },
      updateData,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );
    
    console.log('Updated settings:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Update specific setting error:', error);
    res.status(500).json({ message: 'Failed to update setting' });
  }
};

// Reset settings to default
const resetUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const defaultSettings = {
      user: userId,
      theme: 'light',
      taskViewMode: 'list',
      notifications: true,
      language: 'en'
    };
    
    console.log('Resetting settings to default for user:', userId);
    
    let settings = await Settings.findOneAndUpdate(
      { user: userId },
      defaultSettings,
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    );
    
    console.log('Reset settings:', settings);
    res.json(settings);
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({ message: 'Failed to reset settings' });
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  updateSpecificSetting,
  resetUserSettings
};
