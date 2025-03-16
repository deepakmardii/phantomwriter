'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import { useNotification } from '@/app/providers/NotificationProvider';
import { useRefreshPosts } from '@/app/hooks/useRefreshPosts';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import LinkedInShareModal from '@/app/components/LinkedInShareModal';

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAuth();
  const { showNotification } = useNotification();
  const { refresh } = useRefreshPosts();

  const [formData, setFormData] = useState({
    topic: '',
    tone: 'professional',
    keywords: '',
  });
  const [generatingPost, setGeneratingPost] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [improvements, setImprovements] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkedInStatus, setLinkedInStatus] = useState({ isConnected: false, isExpired: false });
  const [sharingPost, setSharingPost] = useState(null);

  const handleChange = useCallback(e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const generatePost = async data => {
    setGeneratingPost(true);

    try {
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await fetch('/api/posts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          improvements: improvements.trim() || undefined,
          keywords: data.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
        }),
      });

      const responseData = await res.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to generate post');
      }

      showNotification(
        `Post generated successfully! ${responseData.remainingPosts} posts remaining this month.`,
        'success'
      );
      setCurrentPost(responseData.post);
      setFormData({
        topic: '',
        tone: 'professional',
        keywords: '',
      });
      setImprovements('');

      // Refresh usage stats
      window.dispatchEvent(new CustomEvent('refreshUsageStats'));
    } catch (err) {
      console.error('Error generating post:', err);
      showNotification(err.message, 'error');
      if (err.message === 'No authentication token found') {
        router.push('/auth/login');
      }
    } finally {
      setGeneratingPost(false);
    }
  };

  const handleSubmit = async e => {
    e?.preventDefault(); // Make preventDefault optional for regeneration
    await generatePost(formData);
  };

  const handleCopy = async () => {
    if (!currentPost) return;
    try {
      await navigator.clipboard.writeText(currentPost.content);
      showNotification('Post copied to clipboard!', 'success');
    } catch (err) {
      showNotification('Failed to copy post', 'error');
    }
  };

  const handleRegenerate = () => {
    if (currentPost) {
      const newFormData = {
        topic: currentPost.topic,
        tone: currentPost.tone,
        keywords: currentPost.keywords.join(', '),
      };
      setFormData(newFormData);
      generatePost(newFormData); // Directly call generatePost with new data
    }
  };

  const checkLinkedInStatus = async () => {
    if (!isAuthenticated) return;
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
    if (!isAuthenticated) {
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

  const shareToLinkedIn = async formData => {
    if (!isAuthenticated) {
      showNotification('Please login to share posts', 'error');
      return;
    }
    setSharingPost(currentPost._id);
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to share post');
      const data = await res.json();

      if (data.success) {
        showNotification('Successfully shared to LinkedIn!', 'success');
        setShowShareModal(false);
      } else {
        throw new Error(data.error || 'Failed to share post');
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSharingPost(null);
    }
  };

  // Check LinkedIn status on mount
  useEffect(() => {
    if (isAuthenticated) {
      checkLinkedInStatus();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Generate Post Form */}
          <div className="lg:w-1/2">
            <div className="bg-white px-4 py-5 rounded-lg shadow-sm border border-gray sm:p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Generate New Post</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                    Topic
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    required
                    disabled={generatingPost}
                    className="mt-1 block w-full bg-white border border-gray rounded-lg shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="E.g., Leadership in tech, Remote work challenges"
                  />
                </div>

                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
                    Tone
                  </label>
                  <select
                    id="tone"
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    disabled={generatingPost}
                    className="mt-1 block w-full bg-white border border-gray rounded-lg shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="thought-leadership">Thought Leadership</option>
                    <option value="storytelling">Storytelling</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    disabled={generatingPost}
                    className="mt-1 block w-full bg-white border border-gray rounded-lg shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="E.g., innovation, leadership, technology"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingPost}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingPost ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Post'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Current Post & Actions */}
          <div className="lg:w-1/2">
            <div className="bg-white px-4 py-5 rounded-lg shadow-sm border border-gray sm:p-6 h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Post</h2>
              {!linkedInStatus.isConnected && (
                <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-between border border-gray">
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
              {currentPost ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray">
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{currentPost.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentPost.keywords?.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-500/10 rounded-full text-xs text-orange-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleCopy}
                          className="flex-1 py-2 px-4 border border-gray text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Copy to Clipboard
                        </button>
                        {linkedInStatus.isConnected && (
                          <button
                            onClick={() => setShowShareModal(true)}
                            className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            Share to LinkedIn
                          </button>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="improvements"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Improvements needed
                        </label>
                        <textarea
                          id="improvements"
                          value={improvements}
                          onChange={e => setImprovements(e.target.value)}
                          placeholder="Describe what improvements you want in the regenerated post..."
                          className="w-full bg-white border border-gray rounded-lg shadow-sm py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors mb-3"
                          rows={2}
                        />
                        <button
                          onClick={handleRegenerate}
                          disabled={generatingPost}
                          className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingPost ? 'Generating...' : 'Not happy? Generate again'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  Generated post will appear here
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <LinkedInShareModal
          post={currentPost}
          onClose={() => {
            setShowShareModal(false);
          }}
          onShare={shareToLinkedIn}
          isSharing={sharingPost === currentPost?._id}
        />
      )}
    </div>
  );
}
