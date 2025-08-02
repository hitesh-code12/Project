import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ConnectionTest = () => {
  const { apiCall } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiCall('/test');
      setTestResult({
        success: true,
        data: response,
        message: 'Connection successful!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Connection failed!'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="btn-primary mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className={`p-4 rounded-lg ${
          testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h4 className={`font-medium ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.message}
          </h4>
          
          {testResult.success ? (
            <pre className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          ) : (
            <p className="mt-2 text-sm text-red-700">
              Error: {testResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest; 