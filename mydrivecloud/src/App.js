import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminDashboard from './components/admin/AdminDashboard';
import PlayerDashboard from './components/player/PlayerDashboard';
import Navigation from './components/common/Navigation';
import LoadingSpinner from './components/common/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {currentUser && <Navigation />}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={currentUser ? <Navigate to="/" /> : <Login />} 
            />
            <Route 
              path="/signup" 
              element={currentUser ? <Navigate to="/" /> : <Signup />} 
            />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  {userRole === 'admin' ? <AdminDashboard /> : <PlayerDashboard />}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/player/*" 
              element={
                <ProtectedRoute allowedRoles={['player']}>
                  <PlayerDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
};

// Root App Component
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
