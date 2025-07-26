import React from 'react';
import { DollarSign } from 'lucide-react';

const MyPayments = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Payments</h1>
        <p className="text-gray-600">View your payment history and upload proofs</p>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Payments</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to view payment history and upload payment proofs.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: Upload payment screenshots, view payment status, and track expenses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyPayments; 