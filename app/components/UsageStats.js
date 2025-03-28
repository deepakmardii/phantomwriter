'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import LoadingSpinner from './LoadingSpinner';
import Link from 'next/link';

export default function UsageStats() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [cancelingTrial, setCancelingTrial] = useState(false);

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

  const { postUsage = { count: 0, monthlyLimit: 0 }, subscription = { status: 'free' } } =
    userStats;
  const usagePercentage = postUsage.monthlyLimit
    ? (postUsage.count / postUsage.monthlyLimit) * 100
    : 0;
  // Get the correct end date based on subscription status
  const getEndDate = () => {
    if (subscription.status === 'trial' && subscription.trialEndsAt) {
      return new Date(subscription.trialEndsAt);
    }
    if (subscription.expiresAt) {
      return new Date(subscription.expiresAt);
    }
    return new Date(postUsage.lastResetDate || Date.now());
  };

  const nextResetDate = getEndDate();

  return (
    <div className="bg-white px-4 py-5 rounded-lg shadow-sm border border-gray sm:p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Usage Statistics</h2>

      <div className="space-y-4">
        {subscription.status === 'free' ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Start your 3-day free trial to generate up to 45 posts per month
            </p>
            <Link
              href="/subscription"
              className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">
                  Posts Generated: {postUsage.count} / {postUsage.monthlyLimit}
                </span>
                <span className="text-gray-600 text-sm">
                  {postUsage.monthlyLimit - postUsage.count} remaining
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>
                {subscription.status === 'trial' ? 'Trial Ends:' : 'Next Reset:'}{' '}
                {nextResetDate.toLocaleDateString()}
              </span>
              <span>
                Plan: {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </>
        )}

        {(subscription.status === 'trial' || subscription.status === 'expired') && (
          <div className="mt-4">
            <div
              className={`p-4 ${subscription.status === 'trial' ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'} border rounded-lg mb-4`}
            >
              <p
                className={`${subscription.status === 'trial' ? 'text-orange-800' : 'text-red-800'} text-sm`}
              >
                {subscription.status === 'trial'
                  ? `Your trial period ends on ${nextResetDate.toLocaleDateString()}. Subscribe now to keep generating posts!`
                  : 'Your subscription has expired. Subscribe now to continue generating posts.'}
              </p>
            </div>
            <div className="text-center space-x-4">
              <Link
                href="/subscription"
                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {subscription.status === 'trial' ? 'Choose a Plan' : 'Renew Subscription'}
              </Link>
              {subscription.status === 'trial' && (
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        'Are you sure you want to cancel your trial? This action cannot be undone.'
                      )
                    ) {
                      setCancelingTrial(true);
                      try {
                        const response = await fetch('/api/user/subscription/cancel', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        const data = await response.json();
                        if (data.success) {
                          window.dispatchEvent(new CustomEvent('refreshUsageStats'));
                        } else {
                          throw new Error(data.message);
                        }
                      } catch (error) {
                        console.error('Error cancelling trial:', error);
                        alert('Failed to cancel trial. Please try again.');
                      } finally {
                        setCancelingTrial(false);
                      }
                    }
                  }}
                  disabled={cancelingTrial}
                  className={`inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 ${
                    cancelingTrial ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {cancelingTrial ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Canceling...
                    </span>
                  ) : (
                    'Cancel Trial'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
