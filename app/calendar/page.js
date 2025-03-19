'use client';
/* eslint-disable no-console */
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import PostCalendar from '../components/PostCalendar';
import LoadingSpinner from '../components/LoadingSpinner';
import LinkedInShareModal from '../components/LinkedInShareModal';

export default function CalendarPage() {
  const { status } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState(null);
  const [linkedInStatus, setLinkedInStatus] = useState({ isConnected: false, isExpired: false });

  const fetchScheduledPosts = useCallback(async () => {
    try {
      const response = await fetch('/api/posts/get?scheduled=true', {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch posts');
      }

      setPosts(
        data.posts.map(post => ({
          ...post,
          onEdit: post => setEditingPost(post),
          onDelete: async post => {
            if (confirm('Are you sure you want to delete this scheduled post?')) {
              try {
                const response = await fetch(`/api/posts/delete?id=${post._id}`, {
                  method: 'DELETE',
                  credentials: 'include',
                });

                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(data.error || 'Failed to delete post');
                }

                // Refresh posts after deletion
                fetchScheduledPosts();
              } catch (error) {
                console.error('Error deleting post:', error);
                setError(error.message);
              }
            }
          },
        }))
      );
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [setError, setPosts, setLoading, setEditingPost]);

  const checkLinkedInStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/linkedin/status', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to check LinkedIn status');
      const data = await res.json();
      setLinkedInStatus(data);
    } catch (error) {
      console.error('Failed to check LinkedIn status:', error);
      setError('Failed to check LinkedIn connection status');
    }
  }, [setLinkedInStatus, setError]);

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
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchScheduledPosts();
      checkLinkedInStatus();
    }
  }, [status, fetchScheduledPosts, checkLinkedInStatus]);

  const handleShare = async formData => {
    if (!linkedInStatus.isConnected) {
      setError('Please connect your LinkedIn account first');
      return;
    }

    setIsSharing(true);
    setError(null);
    try {
      // Verify LinkedIn status before proceeding
      const statusRes = await fetch('/api/linkedin/status', {
        credentials: 'include',
      });
      const statusData = await statusRes.json();

      if (!statusData.isConnected) {
        setError('Please connect your LinkedIn account to share posts');
        return;
      }

      if (statusData.isExpired) {
        setError('Your LinkedIn connection has expired. Please reconnect your account.');
        return;
      }

      // If editing a scheduled post, ensure we preserve the scheduling
      if (editingPost?.isScheduled && editingPost?.scheduledFor) {
        if (!formData.get('isScheduled')) {
          formData.append('isScheduled', 'true');
          formData.append('scheduledFor', editingPost.scheduledFor);
          formData.append(
            'timezone',
            editingPost.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
          );
        }
      }

      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to share post');
      }

      console.log(data.message);
      setEditingPost(null);
      await fetchScheduledPosts();
    } catch (error) {
      console.error('Error sharing post:', error);
      setError(error.message);
      console.error('Error details:', error);

      try {
        const errorData = await error.response?.json();
        if (errorData?.error) {
          setError(errorData.error);
        }
        if (errorData?.details) {
          console.error('Additional error details:', errorData.details);
        }
      } catch (e) {
        console.error('Could not parse error response:', e);
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Please login to view scheduled posts</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Scheduled Posts</h1>
        <div className="bg-white px-6 py-6 rounded-xl shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
          {!linkedInStatus.isConnected && (
            <div className="bg-white p-4 rounded-lg mb-6 flex items-center justify-between border border-gray-200 shadow-sm">
              <div>
                <h3 className="text-gray-800 font-medium">Connect LinkedIn Account</h3>
                <p className="text-gray-600 text-sm">
                  Connect your LinkedIn account to share scheduled posts directly to your feed
                </p>
              </div>
              <button
                onClick={connectLinkedIn}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 flex items-center gap-2 shadow-sm"
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <PostCalendar posts={posts} />
        </div>
      </div>

      {editingPost && (
        <LinkedInShareModal
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onShare={handleShare}
          isSharing={isSharing}
        />
      )}
    </div>
  );
}
