import React from 'react';
import { Calendar } from 'lucide-react';

const MyBookings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">View your badminton session bookings</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Bookings</h3>
          <p className="text-gray-600 mb-4">
            This feature will show all your badminton session bookings.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: View booking history, session details, and payment status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyBookings; 