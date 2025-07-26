import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Plus,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PlayersManagement from './PlayersManagement';
import VenuesManagement from './VenuesManagement';
import BookingsManagement from './BookingsManagement';
import PaymentsManagement from './PaymentsManagement';

const AdminDashboard = () => {
  const { currentUser, apiCall } = useAuth();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalVenues: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch dashboard stats from backend
      const response = await apiCall('/admin/dashboard');
      setStats({
        totalPlayers: response.stats.totalUsers || 0,
        totalVenues: response.stats.totalVenues || 0,
        totalBookings: response.stats.totalBookings || 0,
        totalRevenue: response.stats.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to basic stats if API fails
      setStats({
        totalPlayers: 0,
        totalVenues: 0,
        totalBookings: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <div className="card hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser?.name}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Players"
              value={stats.totalPlayers}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Venues"
              value={stats.totalVenues}
              icon={MapPin}
              color="bg-green-500"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={Calendar}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              color="bg-yellow-500"
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Add New Player"
                description="Register a new player to the system"
                icon={Plus}
                color="bg-blue-500"
                href="/admin/players"
              />
              <QuickActionCard
                title="Add New Venue"
                description="Add a new badminton venue with location"
                icon={MapPin}
                color="bg-green-500"
                href="/admin/venues"
              />
              <QuickActionCard
                title="Create Booking"
                description="Schedule a new badminton session"
                icon={Calendar}
                color="bg-purple-500"
                href="/admin/bookings"
              />
              <QuickActionCard
                title="View Payments"
                description="Review payment proofs and history"
                icon={DollarSign}
                color="bg-yellow-500"
                href="/admin/payments"
              />
              <QuickActionCard
                title="System Settings"
                description="Configure rates and system preferences"
                icon={Settings}
                color="bg-gray-500"
                href="/admin/settings"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="card">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New booking created for Saturday session</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">New player "John Doe" registered</span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Payment proof uploaded for Friday session</span>
                  <span className="text-xs text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      } />
      
      <Route path="/players" element={<PlayersManagement />} />
      <Route path="/venues" element={<VenuesManagement />} />
      <Route path="/bookings" element={<BookingsManagement />} />
      <Route path="/payments" element={<PaymentsManagement />} />
    </Routes>
  );
};

export default AdminDashboard; 