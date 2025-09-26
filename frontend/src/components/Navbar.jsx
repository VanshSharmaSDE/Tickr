import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useFocusMode } from '../context/FocusModeContext';
import DeleteAccountModal from './DeleteAccountModal';
import { 
  FiHome, 
  FiClipboard, 
  FiBarChart2, 
  FiUser, 
  FiLogOut,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiSettings,
  FiGrid,
  FiList,
  FiZap,
  FiZapOff,
  FiEdit2,
  FiCheck,
  FiXCircle,
  FiTrash2,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { user, logout, updateName, deleteAccount } = useAuth();
  const { isDark, toggleTheme, isCardView, toggleViewMode, animationsEnabled, toggleAnimations, focusMode, toggleFocusMode, syncing } = useSettings();
  const { isInFocusMode, exitFocusMode } = useFocusMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const settingsRef = useRef(null);
  const nameInputRef = useRef(null);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNameEdit = () => {
    setNewName(user?.name || '');
    setIsEditingName(true);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setNewName('');
  };

  const handleNameSave = async () => {
    if (!newName.trim() || newName.trim() === user?.name) {
      handleNameCancel();
      return;
    }

    setIsUpdatingName(true);
    const result = await updateName(newName.trim());
    setIsUpdatingName(false);

    if (result.success) {
      setIsEditingName(false);
      setNewName('');
    }
  };

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handleDeleteAccount = async (password) => {
    setIsDeletingAccount(true);
    const result = await deleteAccount(password);
    setIsDeletingAccount(false);
    
    if (result.success) {
      setIsDeleteModalOpen(false);
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Tickr Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Tickr
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  v1.0.0
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* User name - editable */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 group overflow-hidden">
              <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-400 dark:border-gray-500 focus:outline-none focus:border-primary-500 min-w-0 w-32"
                    disabled={isUpdatingName}
                    maxLength={50}
                    minLength={2}
                  />
                  <button
                    onClick={handleNameSave}
                    disabled={isUpdatingName || !newName.trim() || newName.trim().length < 2}
                    className="p-1 rounded text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <FiCheck className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleNameCancel}
                    disabled={isUpdatingName}
                    className="p-1 rounded text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <FiXCircle className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                  <button
                    onClick={handleNameEdit}
                    className="ml-0 group-hover:ml-2 w-0 group-hover:w-6 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 ease-in-out overflow-hidden"
                  >
                    <FiEdit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                </div>
              )}
            </div>

            {/* Settings dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative ${
                  syncing ? 'animate-pulse' : ''
                }`}
              >
                <FiSettings className="w-5 h-5" />
                {syncing && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </button>

              {/* Settings dropdown menu */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* View mode toggle (only show on dashboard) */}
                  {location.pathname === '/dashboard' && (
                    <>
                      <button
                        onClick={() => {
                          toggleViewMode();
                          setIsSettingsOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                      >
                        {isCardView ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
                        <span>{isCardView ? 'List View' : 'Card View'}</span>
                      </button>
                      
                      {/* Focus Mode toggle */}
                      <button
                        onClick={() => {
                          // Navigate to dashboard if not already there
                          if (location.pathname !== '/dashboard') {
                            navigate('/dashboard');
                          }
                          // Use a custom event to trigger focus modal
                          window.dispatchEvent(new CustomEvent('openFocusModal'));
                          setIsSettingsOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                      >
                        <FiZap className="w-4 h-4" />
                        <span>Focus Mode</span>
                      </button>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    </>
                  )}

                  {/* Dark/Light mode toggle */}
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsSettingsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  {/* Animation toggle */}
                  <button
                    onClick={() => {
                      toggleAnimations();
                      setIsSettingsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                  >
                    {animationsEnabled ? <FiZapOff className="w-4 h-4" /> : <FiZap className="w-4 h-4" />}
                    <span>{animationsEnabled ? 'Disable Animations' : 'Enable Animations'}</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  {/* Delete Account */}
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsSettingsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Account</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsSettingsOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                {/* User name in mobile - editable */}
                <div className="flex items-center space-x-2 px-3 py-2 text-gray-900 dark:text-white mb-2 group">
                  <FiUser className="w-4 h-4" />
                  {isEditingName ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleNameKeyPress}
                        className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-400 dark:border-gray-500 focus:outline-none focus:border-primary-500 flex-1 min-w-0"
                        disabled={isUpdatingName}
                        maxLength={50}
                        minLength={2}
                      />
                      <button
                        onClick={handleNameSave}
                        disabled={isUpdatingName || !newName.trim() || newName.trim().length < 2}
                        className="p-1 rounded text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <FiCheck className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleNameCancel}
                        disabled={isUpdatingName}
                        className="p-1 rounded text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <FiXCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <button
                        onClick={handleNameEdit}
                        className="ml-auto p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Theme toggle in mobile */}
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left transition-colors"
                >
                  {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Delete Account in mobile */}
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
                
                {/* Logout in mobile */}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
      />
    </>
  );
};

export default Navbar;
