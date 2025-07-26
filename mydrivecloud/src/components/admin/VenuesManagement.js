import React from 'react';
import { MapPin, Plus } from 'lucide-react';

const VenuesManagement = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues Management</h1>
          <p className="text-gray-600">Manage badminton venues and locations</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Venue</span>
        </button>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Venues Management</h3>
          <p className="text-gray-600 mb-4">
            This feature will include map integration for venue management.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Add venues with location selection, view on map, and manage venue details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VenuesManagement; 