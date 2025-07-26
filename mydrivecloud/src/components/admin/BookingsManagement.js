import React from 'react';
import { Calendar, Plus } from 'lucide-react';

const BookingsManagement = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage badminton session bookings</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Create Booking</span>
        </button>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bookings Management</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to create and manage badminton session bookings.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Create bookings, assign players, set rates, and track expenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingsManagement; 