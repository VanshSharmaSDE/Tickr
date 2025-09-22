import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {user && <Navbar />}
      
      <Routes>
        {/* Landing Page - Show to non-authenticated users */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route 
          path="/forgot-password" 
          element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} 
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
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
