'use client';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function LinkedInSettings() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ isConnected: false, isExpired: false });
  const [error, setError] = useState(null);

  const checkLinkedInStatus = async () => {
    try {
      const res = await fetch('/api/linkedin/status', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to check LinkedIn status');
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
      setError('Failed to check LinkedIn connection status');
    } finally {
      setLoading(false);
    }
  };

  const connectLinkedIn = async () => {
    try {
      const res = await fetch('/api/linkedin/auth', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to initialize LinkedIn auth');
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      setError('Failed to connect LinkedIn account');
      console.error('Failed to connect:', error);
    }
  };

  const disconnectLinkedIn = async () => {
    try {
      const res = await fetch('/api/linkedin/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to disconnect LinkedIn');
      const data = await res.json();
      if (data.success) {
        setStatus({ isConnected: false, isExpired: false });
      }
    } catch (error) {
      setError('Failed to disconnect LinkedIn account');
      console.error('Failed to disconnect:', error);
    }
  };

  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <LoadingSpinner className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">LinkedIn Connection</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-600 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-700">
            Status:{' '}
            <span
              className={`font-medium ${
                status.isConnected
                  ? status.isExpired
                    ? 'text-yellow-600'
                    : 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {status.isConnected
                ? status.isExpired
                  ? 'Connected (Token Expired)'
                  : 'Connected'
                : 'Not Connected'}
            </span>
          </p>
          {status.isConnected && (
            <p className="text-sm text-gray-600 mt-1">
              Your posts can be shared directly to LinkedIn
            </p>
          )}
        </div>

        <button
          onClick={status.isConnected ? disconnectLinkedIn : connectLinkedIn}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            status.isConnected
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
        >
          {status.isConnected ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Disconnect
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              Connect LinkedIn
            </>
          )}
        </button>
      </div>
    </div>
  );
}
