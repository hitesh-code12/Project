import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminDashboard from './components/admin/AdminDashboard';
import PlayerDashboard from './components/player/PlayerDashboard';
import Navigation from './components/common/Navigation';
import LoadingSpinner from './components/common/LoadingSpinner';

// Management Components
import PlayersManagement from './components/admin/PlayersManagement';
import VenuesManagement from './components/admin/VenuesManagement';
import BookingsManagement from './components/admin/BookingsManagement';
import PaymentsManagement from './components/admin/PaymentsManagement';
import AvailabilityManagement from './components/admin/AvailabilityManagement';
import LeagueManagement from './components/admin/LeagueManagement';

// Player Components
import Availability from './components/player/Availability';
import Leaderboard from './components/common/Leaderboard';

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
        
        <main className="container mx-auto px-4 py-4 lg:py-8">
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
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/players" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PlayersManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/venues" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VenuesManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/bookings" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BookingsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/payments" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PaymentsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/availability" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AvailabilityManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leagues" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <LeagueManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Player Routes */}
            <Route 
              path="/player" 
              element={
                <ProtectedRoute allowedRoles={['player']}>
                  <PlayerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/player/availability" 
              element={
                <ProtectedRoute allowedRoles={['player']}>
                  <Availability />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Routes */}
            <Route 
              path="/leaderboard" 
              element={
                <ProtectedRoute>
                  <Leaderboard />
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
