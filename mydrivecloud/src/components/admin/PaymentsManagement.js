import React from 'react';
import { DollarSign, Upload } from 'lucide-react';

const PaymentsManagement = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Review payment proofs and track expenses</p>
        </div>
      </div>

      <div className="card">
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payments Management</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to review payment proofs and track expenses.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: View uploaded payment proofs, approve payments, and generate expense reports.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManagement; 