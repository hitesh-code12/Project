import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const Availability = () => {
  const { apiCall } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userResponse, setUserResponse] = useState(null);

  useEffect(() => {
    fetchCurrentWeekAvailability();
  }, []);

  const fetchCurrentWeekAvailability = async () => {
    try {
      const response = await apiCall('/availability/current-week');
      setCurrentWeek(response.data);
      
      // Find user's response
      const userResponse = response.data.availablePlayers
        .concat(response.data.unavailablePlayers)
        .find(a => a.user._id === JSON.parse(localStorage.getItem('user')).id);
      
      setUserResponse(userResponse);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  const submitAvailability = async (isAvailable) => {
    setSubmitting(true);
    try {
      const gameDate = currentWeek.gameDate;
      await apiCall('/availability/respond', {
        method: 'POST',
        body: JSON.stringify({
          isAvailable,
          gameDate: gameDate
        }),
      });
      
      toast.success(`Availability submitted: ${isAvailable ? 'Available' : 'Not Available'}`);
      fetchCurrentWeekAvailability(); // Refresh data
    } catch (error) {
      console.error('Error submitting availability:', error);
      toast.error('Failed to submit availability');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Availability</h1>
        <p className="text-gray-600 mt-2">Respond to this week's game invitation</p>
      </div>

      {/* Current Week Info */}
      <div className="card">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Calendar className="h-8 w-8 text-primary-600" />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Game on {formatDate(currentWeek.gameDate)}
            </h2>
            <p className="text-gray-600">
              Week of {formatDate(currentWeek.weekStart)}
            </p>
          </div>
        </div>

        {/* Response Section */}
        {!userResponse ? (
          <div className="text-center space-y-4">
            <p className="text-gray-700">Are you available for this week's game?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => submitAvailability(true)}
                disabled={submitting}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>Yes, I'm Available</span>
              </button>
              <button
                onClick={() => submitAvailability(false)}
                disabled={submitting}
                className="btn-secondary flex items-center space-x-2"
              >
                <XCircle size={20} />
                <span>Not Available</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              userResponse.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {userResponse.isAvailable ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span className="font-medium">
                {userResponse.isAvailable ? 'Available' : 'Not Available'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Response submitted on {formatDate(userResponse.responseDate)}
            </p>
            <button
              onClick={() => setUserResponse(null)}
              className="text-primary-600 hover:text-primary-700 text-sm mt-2"
            >
              Change Response
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{currentWeek.totalPlayers}</h3>
          <p className="text-gray-600">Total Players</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{currentWeek.availableCount}</h3>
          <p className="text-gray-600">Available</p>
        </div>
        
        <div className="card text-center">
          <div className="flex items-center justify-center mb-2">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{currentWeek.nonRespondedPlayers.length}</h3>
          <p className="text-gray-600">Pending Response</p>
        </div>
      </div>

      {/* Available Players List */}
      {currentWeek.availablePlayers.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Available Players ({currentWeek.availablePlayers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentWeek.availablePlayers.map((availability) => (
              <div key={availability._id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-medium text-sm">
                    {availability.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{availability.user.name}</p>
                  <p className="text-sm text-gray-600">{availability.user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability; 