import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { focusService } from '../services/focusService';
import { useAuth } from './AuthContext';

const FocusModeContext = createContext();

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

export const FocusModeProvider = ({ children }) => {
  const { user, token } = useAuth(); // Get authentication state
  const [isInFocusMode, setIsInFocusMode] = useState(false);
  const [focusEntries, setFocusEntries] = useState([]); // Changed from focusTasks to focusEntries
  const [focusStats, setFocusStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(false); // Start with false, only load if authenticated

  // Load focus mode status and tasks on component mount
  useEffect(() => {
    const initializeFocusMode = async () => {
      // Only initialize focus mode if user is authenticated
      if (!user || !token) {
        console.log('FocusModeContext: User not authenticated, skipping focus mode initialization');
        setIsInFocusMode(false);
        setFocusEntries([]);
        setFocusStats({
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          completionRate: 0
        });
        setLoading(false);
        return;
      }

      try {
        console.log('FocusModeContext: User authenticated, initializing focus mode...');
        await loadFocusMode();
      } catch (error) {
        console.error('Failed to initialize focus mode, using defaults:', error);
        setIsInFocusMode(false);
        setFocusEntries([]);
        setFocusStats({
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          completionRate: 0
        });
        setLoading(false);
      }
    };
    initializeFocusMode();
  }, [user, token]); // Depend on user and token changes

  // Load focus mode data from backend
  const loadFocusMode = async () => {
    try {
      console.log('FocusModeContext: Starting loadFocusMode...');
      setLoading(true);
      
      // Use the focusService which already has error handling built-in
      const focusData = await focusService.getFocusMode();
      
      console.log('FocusModeContext: Raw focus data from backend:', focusData);
      
      setIsInFocusMode(focusData.isEnabled || false);
      // Backend returns 'tasks' array with focusId, taskId, order, addedToFocusAt
      setFocusEntries(focusData.tasks || []);
      setFocusStats({
        totalTasks: focusData.totalTasks || 0,
        completedTasks: 0,
        pendingTasks: focusData.totalTasks || 0,
        completionRate: 0
      });
      
      console.log('FocusModeContext: Focus entries set:', focusData.tasks || []);
      console.log('FocusModeContext: Is in focus mode:', focusData.isEnabled);
    } catch (error) {
      console.error('FocusModeContext: Failed to load focus mode:', error);
      
      // Set safe default values on error to prevent crashes
      setIsInFocusMode(false);
      setFocusEntries([]);
      setFocusStats({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0
      });
      
      // Don't show toast error on initial load - focusService already handles this
      console.warn('Using default focus mode settings due to load failure');
    } finally {
      setLoading(false);
    }
  };

  // Start focus mode with selected tasks (by task IDs)
  const startFocusMode = async (selectedTaskIds) => {
    try {
      // Enable focus mode (this clears any existing focus entries)
      await focusService.enableFocusMode();
      
      // Add selected tasks to focus mode by their IDs
      if (selectedTaskIds && selectedTaskIds.length > 0) {
        await focusService.addTasksToFocus(selectedTaskIds);
      }
      
      // Reload focus mode data
      await loadFocusMode();
      
      toast.success('Focus mode activated');
    } catch (error) {
      console.error('Error starting focus mode:', error);
      toast.error('Failed to start focus mode. Please try again.');
      throw error;
    }
  };

  // Exit focus mode
  const exitFocusMode = async () => {
    try {
      // Disable focus mode (clears all focus entries)
      await focusService.disableFocusMode();
      
      // Update local state
      setIsInFocusMode(false);
      setFocusEntries([]); // Changed from focusTasks to focusEntries
      setFocusStats({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0
      });
      
      toast.success('Focus mode deactivated');
    } catch (error) {
      console.error('Error exiting focus mode:', error);
      toast.error('Failed to exit focus mode. Please try again.');
      throw error;
    }
  };

  // Remove focus task by focus entry ID
  const removeFocusTask = async (focusId) => {
    try {
      await focusService.removeFocusTask(focusId);
      
      // Reload to get updated data
      await loadFocusMode();
      
      toast.success('Task removed from focus mode');
    } catch (error) {
      console.error('Error removing focus task:', error);
      toast.error('Failed to remove task. Please try again.');
    }
  };

  // Add task to focus mode by task ID
  const addTaskToFocus = async (taskId) => {
    try {
      await focusService.addFocusTask(taskId);
      
      // Reload to get updated data
      await loadFocusMode();
      
      toast.success('Task added to focus mode');
    } catch (error) {
      console.error('Error adding focus task:', error);
      toast.error('Failed to add task. Please try again.');
      throw error;
    }
  };

  // Get focus tasks (actual task data from focus entries)
  const getFocusTasks = () => {
    return focusEntries.map(entry => entry.task).filter(task => task != null);
  };

  const value = {
    // State
    isInFocusMode,
    focusEntries,
    focusTasks: getFocusTasks(), // Computed property to get actual tasks
    focusStats,
    loading,
    
    // Actions
    startFocusMode,
    exitFocusMode,
    loadFocusMode,
    removeFocusTask,
    addTaskToFocus,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
};