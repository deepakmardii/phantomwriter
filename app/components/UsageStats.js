'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';

export default function UsageStats() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  const fetchUserStats = async () => {
    try {
      const res = await fetch('/api/user/stats');
      const data = await res.json();
      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserStats();

      // Listen for refresh events
      const handleRefresh = () => fetchUserStats();
      window.addEventListener('refreshUsageStats', handleRefresh);

      return () => {
        window.removeEventListener('refreshUsageStats', handleRefresh);
      };
    }
  }, [session]);

  if (loading) {
    return <LoadingSpinner message="Loading usage stats..." />;
  }

  if (!userStats || !userStats.postUsage) {
    return null;
  }

  const { postUsage = { count: 0, monthlyLimit: 50 }, subscription = { status: 'free' } } =
    userStats;
  const usagePercentage = (postUsage.count / postUsage.monthlyLimit) * 100;
  const nextResetDate = new Date(postUsage.lastResetDate || Date.now());
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);

  return (
    <div className="bg-gray-800 px-4 py-5 rounded-lg shadow sm:p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Usage Statistics</h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">
              Posts Generated: {postUsage.count} / {postUsage.monthlyLimit}
            </span>
            <span className="text-gray-400 text-sm">
              {postUsage.monthlyLimit - postUsage.count} remaining
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>Next Reset: {nextResetDate.toLocaleDateString()}</span>
          <span>
            Plan: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>

        {subscription.status === 'free' && (
          <div className="mt-4 text-center">
            <a
              href="/subscription"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Upgrade Plan
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
