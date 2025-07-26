import React from 'react';
import { User } from 'lucide-react';

const PlayerProfile = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Profile</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to manage your profile and account settings.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Update profile information, change password, and manage preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile; 