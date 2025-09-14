'use client';

import { useState } from 'react';
import UnifiedAdminAuth from '@/lib/unified-admin-auth';
import { articleAPI } from '@/lib/api';

const api = articleAPI;

export default function AuthDebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const checkAuth = () => {
    try {
      const { isAuthenticated, session } = UnifiedAdminAuth.isAuthenticated();
      setAuthStatus({ isAuthenticated, session });
    } catch (error) {
      setError('Auth check error: ' + String(error));
    }
  };

  const login = async () => {
    try {
      const result = await UnifiedAdminAuth.login('admin@newstrnt.com', 'admin123');
      setAuthStatus(result);
      if (result.success) {
        setError('Logged in successfully!');
      } else {
        setError('Login failed: ' + result.error);
      }
    } catch (error) {
      setError('Login error: ' + String(error));
    }
  };

  const testAPI = async () => {
    try {
      const drafts = await api.getDrafts();
      setApiResponse(drafts);
      setError('API call successful!');
    } catch (error) {
      setError('API error: ' + String(error));
      setApiResponse(null);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    setAuthStatus(null);
    setApiResponse(null);
    setError('Storage cleared');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button 
            onClick={checkAuth}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Check Auth Status
          </button>
          <button 
            onClick={login}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Login as Admin
          </button>
          <button 
            onClick={testAPI}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test API Call
          </button>
          <button 
            onClick={clearStorage}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Storage
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {authStatus && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">Auth Status:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </div>
        )}

        {apiResponse && (
          <div className="p-4 bg-green-100 rounded">
            <h2 className="text-lg font-semibold mb-2">API Response:</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}