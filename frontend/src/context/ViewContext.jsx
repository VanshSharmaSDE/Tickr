import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};

export const ViewProvider = ({ children }) => {
  const [viewMode, setViewMode] = useState(() => {
    // Get saved view mode from localStorage, default to 'card'
    const saved = localStorage.getItem('taskViewMode');
    return saved || 'card';
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taskViewMode', viewMode);
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'list' : 'card');
  };

  const setCardView = () => {
    setViewMode('card');
  };

  const setListView = () => {
    setViewMode('list');
  };

  const value = {
    viewMode,
    isCardView: viewMode === 'card',
    isListView: viewMode === 'list',
    toggleViewMode,
    setCardView,
    setListView
  };

  return (
    <ViewContext.Provider value={value}>
      {children}
    </ViewContext.Provider>
  );
};
