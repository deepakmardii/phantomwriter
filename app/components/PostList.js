'use client';
import { useState, useEffect } from 'react';
import { useNotification } from '../providers/NotificationProvider';
import { useRefreshPosts } from '../hooks/useRefreshPosts';
import { usePagination } from '../hooks/usePagination';
import LoadingSpinner from './LoadingSpinner';
import LinkedInShareModal from './LinkedInShareModal';
import { useSession } from 'next-auth/react';

export default function PostList() {
  const { data: session, status } = useSession();
  const { showNotification } = useNotification();
  const { refreshTrigger } = useRefreshPosts();
  const {
    page,
    limit,
    hasMore,
    total,
    loading,
    setLoading,
    nextPage,
    previousPage,
    updatePaginationState,
    totalPages,
    resetPagination,
  } = usePagination();

  const [posts, setPosts] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [linkedInStatus, setLinkedInStatus] = useState({ isConnected: false, isExpired: false });
  const [sharingPost, setSharingPost] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/get?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch posts');

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setPosts(data.posts);
      updatePaginationState(data.pagination);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const checkLinkedInStatus = async () => {
    if (status !== 'authenticated') return;
    try {
      const res = await fetch('/api/linkedin/status');
      if (!res.ok) throw new Error('Failed to check LinkedIn status');
      const data = await res.json();
      setLinkedInStatus(data);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
    }
  };

  const connectLinkedIn = async () => {
    if (status !== 'authenticated') {
      showNotification('Please login to connect LinkedIn account', 'error');
      return;
    }
    try {
      const res = await fetch('/api/linkedin/auth');
      if (!res.ok) throw new Error('Failed to initialize LinkedIn auth');
      const data = await res.json();
      window.location.href = data.url;
    } catch (error) {
      showNotification('Failed to connect LinkedIn account', 'error');
    }
  };

  const handleShareClick = post => {
    setSelectedPost(post);
    setShowShareModal(true);
  };

  const shareToLinkedIn = async formData => {
    if (status !== 'authenticated') {
      showNotification('Please login to share posts', 'error');
      return;
    }
    setSharingPost(selectedPost._id);
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to share post');
      }

      showNotification('Successfully shared to LinkedIn!', 'success');
      setShowShareModal(false);
      setSelectedPost(null);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSharingPost(null);
    }
  };

  // Reset pagination and fetch posts when refresh is triggered or session changes
  useEffect(() => {
    resetPagination();
    fetchPosts();
  }, [refreshTrigger, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch posts when page changes
  useEffect(() => {
    if (!initialLoad) {
      fetchPosts();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check LinkedIn status on mount and after connecting and when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      checkLinkedInStatus();
    }
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading' || initialLoad) {
    return <LoadingSpinner message="Loading posts..." />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Please login to view your posts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!linkedInStatus.isConnected && (
        <div className="bg-white border border-gray p-4 rounded-lg mb-4 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-gray-800 font-medium">Connect LinkedIn Account</h3>
            <p className="text-gray-600 text-sm">
              Connect your LinkedIn account to share posts directly to your feed
            </p>
          </div>
          <button
            onClick={connectLinkedIn}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
            </svg>
            Connect LinkedIn
          </button>
        </div>
      )}

      {posts.map(post => (
        <div
          key={post._id}
          className="bg-white p-4 rounded-lg border border-gray hover:shadow-lg transition-all"
        >
          <p className="text-gray-700 mb-2 whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-4">Topic: {post.topic}</span>
              <span className="mr-4">Tone: {post.tone}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-4">
              {post.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-500 bg-opacity-10 rounded-full text-xs text-orange-600"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              {linkedInStatus.isConnected && (
                <button
                  onClick={() => handleShareClick(post)}
                  disabled={sharingPost === post._id}
                  className="px-3 py-1 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Share to LinkedIn
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {posts.length === 0 && !loading && (
        <p className="text-gray-600 text-center py-4">
          No posts generated yet. Create your first post above!
        </p>
      )}

      {posts.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={previousPage}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages} ({total} posts)
          </span>
          <button
            onClick={nextPage}
            disabled={!hasMore || loading}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {loading && !initialLoad && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner message="Updating posts..." />
        </div>
      )}

      {showShareModal && (
        <LinkedInShareModal
          post={selectedPost}
          onClose={() => {
            setShowShareModal(false);
            setSelectedPost(null);
          }}
          onShare={shareToLinkedIn}
          isSharing={sharingPost === selectedPost?._id}
        />
      )}
    </div>
  );
}
