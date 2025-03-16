'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import UsageStats from '@/app/components/UsageStats';
import LinkedInSettings from '@/app/components/LinkedInSettings';

export default function Settings() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Usage Statistics Section */}
          <UsageStats />

          {/* LinkedIn Settings Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Social Media</h2>
            <LinkedInSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
