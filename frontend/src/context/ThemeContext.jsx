import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set CSS variables for toast styling
    const style = root.style;
    if (isDark) {
      style.setProperty('--toast-bg', '#374151');
      style.setProperty('--toast-color', '#f9fafb');
      style.setProperty('--toast-border', '#4b5563');
    } else {
      style.setProperty('--toast-bg', '#ffffff');
      style.setProperty('--toast-color', '#111827');
      style.setProperty('--toast-border', '#e5e7eb');
    }
    
    localStorage.setItem('theme', JSON.stringify(isDark));
  }, [isDark]);

  // Listen for custom userLogin event to refresh theme from server
  useEffect(() => {
    const handleUserLogin = () => {
      // Simply wait for SettingsContext to update localStorage, then sync once
      setTimeout(() => {
        const userSettings = localStorage.getItem('userSettings');
        if (userSettings) {
          try {
            const settings = JSON.parse(userSettings);
            if (settings.theme) {
              setIsDark(settings.theme === 'dark');
            }
          } catch (error) {
            console.error('Error parsing user settings:', error);
          }
        }
      }, 200); // Give SettingsContext time to update localStorage
    };

    window.addEventListener('userLogin', handleUserLogin);
    return () => window.removeEventListener('userLogin', handleUserLogin);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
