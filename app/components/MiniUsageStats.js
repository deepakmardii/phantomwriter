'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function MiniUsageStats() {
  const { data: session } = useSession();
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
    }
  };

  useEffect(() => {
    if (session) {
      fetchUserStats();
      const handleRefresh = () => fetchUserStats();
      window.addEventListener('refreshUsageStats', handleRefresh);
      return () => window.removeEventListener('refreshUsageStats', handleRefresh);
    }
  }, [session]);

  if (!userStats || !userStats.postUsage) {
    return null;
  }

  const { postUsage = { count: 0, monthlyLimit: 0 }, subscription = { status: 'free' } } =
    userStats;

  const getUsageDisplay = () => {
    if (subscription.status === 'free') {
      return 'Start Free Trial';
    }
    const remainingPosts = postUsage.monthlyLimit - postUsage.count;
    return `${remainingPosts} posts remaining`;
  };

  return (
    <div className="px-4 py-2 text-sm">
      <div className="flex items-center justify-between text-gray-600">
        <span>{getUsageDisplay()}</span>
        <span className="capitalize">{subscription.status}</span>
      </div>
    </div>
  );
}
