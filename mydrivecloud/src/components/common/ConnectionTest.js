import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ConnectionTest = () => {
  const { apiCall } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [detailedTests, setDetailedTests] = useState([]);

  const testConnection = async () => {
    setLoading(true);
    setTestResult(null);
    setNetworkInfo(null);
    setDetailedTests([]);
    
    try {
      // Test basic connectivity first
      const startTime = Date.now();
      const response = await apiCall('/test');
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      setTestResult({
        success: true,
        data: response,
        responseTime,
        message: 'Connection successful!'
      });

      // Get network information
      setNetworkInfo({
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : 'Not available',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Connection failed!',
        errorType: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch('https://badminton-booking-backend.onrender.com/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const endTime = Date.now();
      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        data: data,
        responseTime: endTime - startTime,
        status: response.status,
        statusText: response.statusText,
        message: response.ok ? 'Direct fetch successful!' : 'Direct fetch failed!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Direct fetch failed!',
        errorType: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const testHealthEndpoint = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch('https://badminton-booking-backend.onrender.com/health', {
        method: 'GET',
      });
      const endTime = Date.now();
      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        data: data,
        responseTime: endTime - startTime,
        status: response.status,
        statusText: response.statusText,
        message: response.ok ? 'Health check successful!' : 'Health check failed!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Health check failed!',
        errorType: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const testNetworkDiagnostics = async () => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const response = await fetch('https://badminton-booking-backend.onrender.com/api/network-test', {
        method: 'GET',
      });
      const endTime = Date.now();
      const data = await response.json();
      
      setTestResult({
        success: response.ok,
        data: data,
        responseTime: endTime - startTime,
        status: response.status,
        statusText: response.statusText,
        message: response.ok ? 'Network diagnostics successful!' : 'Network diagnostics failed!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'Network diagnostics failed!',
        errorType: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  const runDetailedNetworkTests = async () => {
    setLoading(true);
    setDetailedTests([]);
    
    const tests = [
      {
        name: 'DNS Resolution Test',
        url: 'https://badminton-booking-backend.onrender.com',
        description: 'Test if Render domain resolves'
      },
      {
        name: 'HTTPS Connection Test',
        url: 'https://badminton-booking-backend.onrender.com/health',
        description: 'Test HTTPS connection to Render'
      },
      {
        name: 'API Endpoint Test',
        url: 'https://badminton-booking-backend.onrender.com/api/test',
        description: 'Test API endpoint accessibility'
      },
      {
        name: 'Alternative Render URL',
        url: 'https://render.com',
        description: 'Test if Render main site is accessible'
      }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const response = await fetch(test.url, {
          method: 'GET',
          mode: 'cors'
        });
        const endTime = Date.now();
        
        results.push({
          name: test.name,
          description: test.description,
          success: response.ok,
          status: response.status,
          responseTime: endTime - startTime,
          error: null
        });
      } catch (error) {
        results.push({
          name: test.name,
          description: test.description,
          success: false,
          status: null,
          responseTime: null,
          error: error.message
        });
      }
    }

    setDetailedTests(results);
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">API Connection Diagnostics</h3>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Testing...' : 'Test API Connection (via AuthContext)'}
        </button>

        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch (bypass AuthContext)'}
        </button>

        <button
          onClick={testHealthEndpoint}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>

        <button
          onClick={testNetworkDiagnostics}
          disabled={loading}
          className="btn-secondary w-full"
        >
          {loading ? 'Testing...' : 'Test Network Diagnostics'}
        </button>

        <button
          onClick={runDetailedNetworkTests}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full"
        >
          {loading ? 'Running Tests...' : 'Run Detailed Network Tests'}
        </button>
      </div>

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
          
          {testResult.responseTime && (
            <p className="text-sm text-gray-600 mt-1">
              Response Time: {testResult.responseTime}ms
            </p>
          )}

          {testResult.status && (
            <p className="text-sm text-gray-600">
              Status: {testResult.status} {testResult.statusText}
            </p>
          )}
          
          {testResult.success ? (
            <pre className="mt-2 text-sm text-green-700 bg-green-100 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-red-700">
                Error Type: {testResult.errorType}
              </p>
              <p className="text-sm text-red-700">
                Error: {testResult.error}
              </p>
            </div>
          )}
        </div>
      )}

      {detailedTests.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Detailed Network Test Results</h4>
          <div className="space-y-2">
            {detailedTests.map((test, index) => (
              <div key={index} className={`p-2 rounded ${
                test.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${
                      test.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {test.name}
                    </p>
                    <p className="text-xs text-gray-600">{test.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    test.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {test.success ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                {test.responseTime && (
                  <p className="text-xs text-gray-600 mt-1">
                    Response Time: {test.responseTime}ms
                  </p>
                )}
                {test.error && (
                  <p className="text-xs text-red-600 mt-1">
                    Error: {test.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {networkInfo && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Network Information</h4>
          <pre className="text-sm text-blue-700 bg-blue-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(networkInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Mobile Network Troubleshooting</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>DNS Issues:</strong> Try switching to mobile data or different WiFi</li>
                          <li>• <strong>ISP Blocking:</strong> Some ISPs block Render domains (less common than Railway)</li>
          <li>• <strong>Corporate Firewall:</strong> Work networks often block external APIs</li>
          <li>• <strong>Mobile Carrier:</strong> Some carriers restrict certain domains</li>
          <li>• <strong>VPN Solution:</strong> Try using a VPN to bypass restrictions</li>
          <li>• <strong>Alternative DNS:</strong> Try 8.8.8.8 or 1.1.1.1</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest; 