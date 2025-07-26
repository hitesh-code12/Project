import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MyBookings from './MyBookings';
import MyPayments from './MyPayments';
import PlayerProfile from './PlayerProfile';

const PlayerDashboard = () => {
  const { currentUser, apiCall } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    pendingPayments: 0,
    upcomingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlayerStats();
  }, [currentUser]);

  const fetchPlayerStats = async () => {
    if (!currentUser) return;

    try {
      // Fetch player's bookings from backend
      const response = await apiCall('/bookings?player=' + currentUser.id);
      const bookings = response.bookings || [];
      
      let totalSpent = 0;
      let pendingPayments = 0;
      let upcomingBookings = 0;
      const today = new Date();

      bookings.forEach(booking => {
        // Calculate stats
        if (booking.costPerPlayer) {
          totalSpent += booking.costPerPlayer;
        }
        
        if (booking.paymentStatus === 'pending') {
          pendingPayments++;
        }
        
        if (new Date(booking.date) > today) {
          upcomingBookings++;
        }
      });

      setStats({
        totalBookings: bookings.length,
        totalSpent: totalSpent,
        pendingPayments: pendingPayments,
        upcomingBookings: upcomingBookings,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error fetching player stats:', error);
      // Fallback to empty data if API fails
      setStats({
        totalBookings: 0,
        totalSpent: 0,
        pendingPayments: 0,
        upcomingBookings: 0,
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'overdue':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Welcome back, {currentUser?.name}!</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={Calendar}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Spent"
              value={`$${stats.totalSpent.toFixed(2)}`}
              icon={DollarSign}
              color="bg-green-500"
            />
            <StatCard
              title="Pending Payments"
              value={stats.pendingPayments}
              icon={AlertCircle}
              color="bg-yellow-500"
            />
            <StatCard
              title="Upcoming Sessions"
              value={stats.upcomingBookings}
              icon={Clock}
              color="bg-purple-500"
            />
          </div>

          {/* Recent Bookings */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
            <div className="card">
              {recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings yet</p>
                  <p className="text-sm text-gray-500">Your recent bookings will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getPaymentStatusIcon(booking.paymentStatus)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {booking.venue?.name || 'Badminton Session'}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(booking.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {booking.startTime} - {booking.endTime}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {booking.venue?.address?.city || 'Location TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${booking.costPerPlayer?.toFixed(2) || '0.00'}
                        </p>
                        <p className={`text-sm ${
                          booking.paymentStatus === 'paid' ? 'text-green-600' :
                          booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                          booking.paymentStatus === 'overdue' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {getPaymentStatusText(booking.paymentStatus)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">View All Bookings</h3>
                    <p className="text-sm text-gray-600">See your complete booking history</p>
                  </div>
                </div>
              </div>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                    <p className="text-sm text-gray-600">Track your payment proofs</p>
                  </div>
                </div>
              </div>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Upcoming Sessions</h3>
                    <p className="text-sm text-gray-600">Check your next games</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } />
      
      <Route path="/bookings" element={<MyBookings />} />
      <Route path="/payments" element={<MyPayments />} />
      <Route path="/profile" element={<PlayerProfile />} />
    </Routes>
  );
};

export default PlayerDashboard; 