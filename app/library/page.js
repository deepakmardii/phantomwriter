'use client';
import { useAuth } from '@/app/providers/AuthProvider';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import PostList from '@/app/components/PostList';

export default function Library() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white px-4 py-5 rounded-lg shadow-sm border border-gray sm:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Posts</h2>
          <PostList />
        </div>
      </div>
    </div>
  );
}
