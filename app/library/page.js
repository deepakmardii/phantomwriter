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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-16 sm:py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post Library</h1>
        <div className="bg-white px-6 py-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
          <PostList />
        </div>
      </div>
    </div>
  );
}
