import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { FocusModeProvider, useFocusMode } from './context/FocusModeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LandingPage from './pages/LandingPage';
import Contact from './pages/Contact';
import ContributionGuide from './pages/ContributionGuide';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FocusModePage from './components/FocusModePage';

function AppContent() {
  const { user, loading } = useAuth();
  const { isInFocusMode, exitFocusMode } = useFocusMode();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only handle focus mode navigation if user is authenticated and not loading
    if (!user || loading) return;

    // Prevent unnecessary redirects by checking current path
    if (isInFocusMode && location.pathname !== '/focus-mode') {
      console.log('Redirecting to focus mode...');
      navigate('/focus-mode', { replace: true });
    } else if (!isInFocusMode && location.pathname === '/focus-mode') {
      console.log('Redirecting from focus mode to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, isInFocusMode, location.pathname, navigate]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {user && !isInFocusMode && <Navbar />}
      
      <Routes>
        {/* Landing Page - Show to non-authenticated users, handle loading state */}
        <Route 
          path="/" 
          element={loading ? null : (user ? <Navigate to="/dashboard" /> : <LandingPage />)} 
        />
        
        {/* Public Routes - Handle loading state */}
        <Route 
          path="/login" 
          element={loading ? null : (user ? <Navigate to="/dashboard" /> : <Login />)} 
        />
        <Route 
          path="/register" 
          element={loading ? null : (user ? <Navigate to="/dashboard" /> : <Register />)} 
        />
        <Route 
          path="/forgot-password" 
          element={loading ? null : (user ? <Navigate to="/dashboard" /> : <ForgotPassword />)} 
        />
        
        {/* Contact Page - Public route */}
        <Route 
          path="/contact" 
          element={<Contact />} 
        />
        
        {/* Contribution Guide - Public route */}
        <Route 
          path="/contribute" 
          element={<ContributionGuide />} 
        />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/focus-mode" element={
          <ProtectedRoute>
            {isInFocusMode ? (
              <FocusModePage onExit={exitFocusMode} />
            ) : (
              <Navigate to="/dashboard" replace />
            )}
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
        
        {/* 404 Not Found Route */}
        <Route 
          path="*" 
          element={<NotFound />} 
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: 'var(--toast-bg, #ffffff)',
            color: 'var(--toast-color, #111827)',
            border: '1px solid var(--toast-border, #e5e7eb)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.75rem',
            padding: '1rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <FocusModeProvider>
          <Router>
            <AppContent />
          </Router>
        </FocusModeProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
