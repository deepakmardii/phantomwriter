'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import UsageStats from '@/app/components/UsageStats';

export default function Settings() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        {/* Usage Statistics Section */}
        <UsageStats />

        {/* Additional settings sections can be added here */}
      </div>
    </div>
  );
}
