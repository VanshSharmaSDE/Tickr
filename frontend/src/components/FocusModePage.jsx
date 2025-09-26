import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiX, 
  FiCheck, 
  FiClock, 
  FiPlay, 
  FiPause, 
  FiSquare,
  FiPlus,
  FiMinus,
  FiTarget,
  FiCheckCircle
} from 'react-icons/fi';
import { useFocusMode } from '../context/FocusModeContext';
import { taskService } from '../services/taskService';

const FocusModePage = ({ onExit }) => {
  const navigate = useNavigate();
  const { 
    focusEntries,
    focusStats, 
    loading,
    removeFocusTask,
    loadFocusMode 
  } = useFocusMode();
  
  const [focusTasks, setFocusTasks] = useState([]);
  const [todayProgress, setTodayProgress] = useState([]);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  
  // Timer state
  const [timerMinutes, setTimerMinutes] = useState(25); // Default Pomodoro time
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  
  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate task counts from actual fetched tasks
  const isTaskCompleted = (taskId) => {
    return todayProgress.some(progress => 
      progress.task._id === taskId && progress.completed
    );
  };
  
  const completedTasksCount = focusTasks.filter(task => isTaskCompleted(task._id)).length;
  const totalTasks = focusTasks.length;

  // Load focus mode data on component mount
  useEffect(() => {
    console.log('FocusModePage mounted, loading focus mode data...');
    loadFocusMode();
    loadTodayProgress();
  }, []);

  // Load today's progress
  const loadTodayProgress = async () => {
    try {
      const response = await taskService.getTodayProgress();
      setTodayProgress(response.data);
      console.log('FocusModePage: Today progress loaded:', response.data);
    } catch (error) {
      console.error('FocusModePage: Failed to load today progress:', error);
      setTodayProgress([]);
    }
  };

  // Fetch actual task data when focus entries change
  useEffect(() => {
    const fetchFocusTasks = async () => {
      if (focusEntries && focusEntries.length > 0) {
        try {
          console.log('FocusModePage: Focus entries from context:', focusEntries);
          
          // Extract task IDs from focus entries
          // Backend structure: { focusId, taskId, order, addedToFocusAt }
          const taskIds = focusEntries.map(entry => entry.taskId).filter(Boolean);
          console.log('FocusModePage: Task IDs to fetch:', taskIds);
          
          if (taskIds.length > 0) {
            console.log('FocusModePage: Fetching all tasks from taskService...');
            // Fetch all tasks and filter by the IDs we need
            const response = await taskService.getTasks();
            const allTasks = response.data; // Extract data from axios response
            console.log('FocusModePage: All tasks fetched:', allTasks);
            
            const filteredTasks = allTasks.filter(task => taskIds.includes(task._id));
            console.log('FocusModePage: Filtered tasks:', filteredTasks);
            console.log('FocusModePage: Sample task completion field:', filteredTasks[0] && {
              _id: filteredTasks[0]._id,
              title: filteredTasks[0].title,
              isCompleted: filteredTasks[0].isCompleted,
              completed: filteredTasks[0].completed,
              status: filteredTasks[0].status
            });
            
            // Sort tasks by focus order
            const orderedTasks = filteredTasks.sort((a, b) => {
              const aEntry = focusEntries.find(entry => entry.taskId === a._id);
              const bEntry = focusEntries.find(entry => entry.taskId === b._id);
              return (aEntry?.order || 0) - (bEntry?.order || 0);
            });
            
            console.log('FocusModePage: Final ordered focus tasks:', orderedTasks);
            setFocusTasks(orderedTasks);
          } else {
            console.log('FocusModePage: No task IDs found in focus entries');
            setFocusTasks([]);
          }
        } catch (error) {
          console.error('FocusModePage: Failed to fetch focus tasks:', error);
          console.error('FocusModePage: Error message:', error.message);
          console.error('FocusModePage: Error response:', error.response?.data);
          toast.error('Failed to load focus tasks');
          setFocusTasks([]);
        }
      } else {
        console.log('FocusModePage: No focus entries found, clearing tasks');
        setFocusTasks([]);
      }
    };

    fetchFocusTasks();
  }, [focusEntries]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(seconds => seconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(minutes => minutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setTimerActive(false);
          setTimerPaused(false);
          toast.success('Focus session completed! 🎉');
          
          // Optional: Play a sound or notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Session Complete!', {
              body: 'Great job! Your focus session has finished.',
              icon: '/logo.png'
            });
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timerPaused, timerMinutes, timerSeconds]);

  const handleTaskToggle = async (taskId) => {
    try {
      // Toggle the actual task using taskService
      await taskService.toggleTaskCompletion(taskId);
      
      // Reload today's progress to get updated completion status
      await loadTodayProgress();
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleRemoveFromFocus = async (taskId) => {
    try {
      // Find the focus entry for this task
      const focusEntry = focusEntries.find(entry => entry.taskId === taskId);
      if (focusEntry) {
        await removeFocusTask(focusEntry.focusId);
        // The context will reload and update focusEntries
      }
    } catch (error) {
      console.error('Failed to remove task from focus:', error);
      toast.error('Failed to remove task from focus');
    }
  };

  const startTimer = () => {
    setTimerActive(true);
    setTimerPaused(false);
  };

  const pauseTimer = () => {
    setTimerPaused(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimerMinutes(25);
    setTimerSeconds(0);
  };

  const adjustTimer = (adjustment) => {
    if (!timerActive) {
      setTimerMinutes(prev => Math.max(1, Math.min(60, prev + adjustment)));
    }
  };

  const handleExitFocus = () => {
    if (timerActive) {
      setShowExitConfirmation(true);
    } else {
      exitFocusMode();
    }
  };

  const exitFocusMode = async () => {
    try {
      await onExit();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to exit focus mode:', error);
      toast.error('Failed to exit focus mode');
    }
  };

  const formatTime = (minutes, seconds) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString([], { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-3 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #d1d5db 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #e5e7eb 0%, transparent 50%)`
        }} />
        <div className="absolute inset-0 dark:opacity-100 opacity-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #4b5563 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #6b7280 0%, transparent 50%)`
        }} />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center p-6 relative z-10 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <FiTarget className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Focus Mode
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {completedTasksCount} of {totalTasks} tasks completed
            </p>
          </div>
        </div>

        <button
          onClick={handleExitFocus}
          className="p-3 hover:bg-red-50 dark:hover:bg-red-600/20 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-600/30 hover:border-red-300 dark:hover:border-red-500/50 group"
        >
          <FiX className="w-6 h-6 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 relative z-10 overflow-hidden">
        {/* Timer Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl">
            {/* Current Time */}
            <div className="text-center mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Current Time</h3>
              <div className="text-3xl font-mono font-bold text-gray-900 dark:text-white mb-2">
                {formatCurrentTime()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentTime.toLocaleDateString([], { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>

            {/* Focus Timer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold mb-4 text-center text-blue-600 dark:text-blue-400">Focus Timer</h3>
              
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white mb-2 bg-white dark:bg-gray-900 rounded-lg py-4 px-6 border border-gray-200 dark:border-gray-600">
                  {formatTime(timerMinutes, timerSeconds)}
                </div>
                <div className="text-sm font-medium">
                  <span className={`px-3 py-1 rounded-full border ${
                    timerActive ? 
                      (timerPaused ? 'border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20') :
                      'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/20'
                  }`}>
                    {timerActive ? (timerPaused ? 'Paused' : 'Active') : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="flex justify-center space-x-3 mb-6">
                {!timerActive ? (
                  <button
                    onClick={startTimer}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200"
                  >
                    <FiPlay className="w-4 h-4" />
                    <span className="font-medium">Start</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={timerPaused ? startTimer : pauseTimer}
                      className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      {timerPaused ? <FiPlay className="w-4 h-4" /> : <FiPause className="w-4 h-4" />}
                      <span className="font-medium">{timerPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <button
                      onClick={stopTimer}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200"
                    >
                      <FiSquare className="w-4 h-4" />
                      <span className="font-medium">Stop</span>
                    </button>
                  </>
                )}
              </div>

              {!timerActive && (
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => adjustTimer(-5)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-center font-mono">
                    {timerMinutes} min
                  </span>
                  <button
                    onClick={() => adjustTimer(5)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Progress Stats */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl flex flex-col">
            {/* Tasks Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Focus Tasks
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Stay focused on what matters most
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-3 py-1 bg-blue-600 dark:bg-blue-600 text-white rounded-full font-medium">
                    {totalTasks} tasks
                  </span>
                </div>
              </div>
            </div>

            {/* Tasks Container with Internal Scrolling */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-6 space-y-4">
                {focusTasks.map((task, index) => {
                  const isCompleted = isTaskCompleted(task._id);
                  console.log(`Task "${task.title}": isCompleted=${isCompleted}`);
                  
                  return (
                    <div
                      key={task._id}
                      className={`group relative p-6 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${
                        isCompleted 
                          ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-75' 
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/80'
                      }`}
                    >
                      {/* Task Number Badge */}
                      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        isCompleted
                          ? 'bg-green-600 dark:bg-green-600 border-green-500 dark:border-green-500 text-white'
                          : 'bg-blue-600 dark:bg-blue-600 border-blue-500 dark:border-blue-500 text-white'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className={`text-lg font-semibold mb-3 transition-all duration-200 ${
                            isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100'
                          }`}>
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className={`text-sm mb-4 leading-relaxed ${
                              isCompleted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                            }`}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            {task.priority && (
                              <span className={`px-3 py-1 rounded-full border font-medium ${
                                task.priority === 'high' ? 'border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
                                task.priority === 'medium' ? 'border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' :
                                'border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                              }`}>
                                {task.priority.toUpperCase()} PRIORITY
                              </span>
                            )}
                            {task.category && (
                              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-full border border-purple-300 dark:border-purple-600 font-medium">
                                {task.category}
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center space-x-1 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-full border border-orange-300 dark:border-orange-600 font-medium">
                                <FiClock className="w-3 h-3" />
                                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTaskToggle(task._id)}
                            className={`p-4 rounded-xl transition-all duration-200 ${
                              isCompleted
                                ? 'bg-green-600 dark:bg-green-600 text-white border-2 border-green-500 dark:border-green-500 hover:bg-green-700 dark:hover:bg-green-700 hover:scale-110'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white border-2 border-gray-300 dark:border-gray-500 hover:bg-blue-600 dark:hover:bg-blue-600 hover:border-blue-500 dark:hover:border-blue-500 hover:text-white hover:scale-110'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isCompleted ? <FiCheckCircle className="w-5 h-5" /> : <FiCheck className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleRemoveFromFocus(task._id)}
                            className="p-4 rounded-xl bg-red-600 dark:bg-red-600 text-white border-2 border-red-500 dark:border-red-500 hover:bg-red-700 dark:hover:bg-red-700 hover:border-red-400 dark:hover:border-red-400 transition-all duration-200 hover:scale-110"
                            title="Remove from focus mode"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {focusTasks.length === 0 && !loading && (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center max-w-md">
                    <div className="mb-6 p-6 bg-white/5 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                      <FiTarget className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">No tasks in focus mode</h3>
                    <p className="text-slate-400 leading-relaxed">
                      Add tasks from your dashboard to start your focused work session. 
                      Select the tasks that matter most for maximum productivity.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/30 border-t-blue-400 mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading your focus tasks...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold mb-4 text-white">Exit Focus Mode?</h3>
            <p className="text-slate-300 mb-6">
              Your timer is still running. Are you sure you want to exit focus mode?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Continue
              </button>
              <button
                onClick={exitFocusMode}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg border border-red-500/30 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default FocusModePage;