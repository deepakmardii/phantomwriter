"use client";
import { useState, useEffect } from "react";
import { useNotification } from "../providers/NotificationProvider";
import { useAuth } from "../providers/AuthProvider";
import { useRefreshPosts } from "../hooks/useRefreshPosts";
import { usePagination } from "../hooks/usePagination";
import LoadingSpinner from "./LoadingSpinner";

export default function PostList() {
  const { token } = useAuth();
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

  const fetchPosts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/get?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setPosts(data.posts);
      updatePaginationState(data.pagination);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Reset pagination and fetch posts when refresh is triggered
  useEffect(() => {
    resetPagination();
    fetchPosts();
  }, [refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch posts when page changes
  useEffect(() => {
    if (!initialLoad) {
      fetchPosts();
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (initialLoad) {
    return <LoadingSpinner message="Loading posts..." />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-gray-700 p-4 rounded hover:bg-gray-600 transition-colors"
        >
          <p className="text-gray-300 mb-2 whitespace-pre-wrap">
            {post.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-400">
              <span className="mr-4">Topic: {post.topic}</span>
              <span className="mr-4">Tone: {post.tone}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            {post.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {posts.length === 0 && !loading && (
        <p className="text-gray-400 text-center py-4">
          No posts generated yet. Create your first post above!
        </p>
      )}

      {posts.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={previousPage}
            disabled={page === 1 || loading}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">
            Page {page} of {totalPages} ({total} posts)
          </span>
          <button
            onClick={nextPage}
            disabled={!hasMore || loading}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {loading && !initialLoad && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner message="Updating posts..." />
        </div>
      )}
    </div>
  );
}
