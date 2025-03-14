"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useNotification } from "@/app/providers/NotificationProvider";
import { useRefreshPosts } from "@/app/hooks/useRefreshPosts";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import PostList from "@/app/components/PostList";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, token, logout } = useAuth();
  const { showNotification } = useNotification();
  const { refresh } = useRefreshPosts();

  const [formData, setFormData] = useState({
    topic: "",
    tone: "professional",
    keywords: "",
  });
  const [generatingPost, setGeneratingPost] = useState(false);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingPost(true);

    try {
      if (!token) {
        throw new Error("No authentication token found");
      }

      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to generate post");
      }

      showNotification("Post generated successfully", "success");
      setFormData({
        topic: "",
        tone: "professional",
        keywords: "",
      });

      // Refresh the posts list
      refresh();
    } catch (err) {
      console.error("Error generating post:", err);
      showNotification(err.message, "error");
      if (err.message === "No authentication token found") {
        router.push("/auth/login");
      }
    } finally {
      setGeneratingPost(false);
    }
  };

  if (!isAuthenticated) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-white">PhantomWriter</div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/subscription")}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Subscription
              </button>
              <button
                onClick={logout}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Generate Post Form */}
        <div className="bg-gray-800 px-4 py-5 rounded-lg shadow sm:p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Generate New Post
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="topic"
                className="block text-sm font-medium text-gray-300"
              >
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
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="E.g., Leadership in tech, Remote work challenges"
              />
            </div>

            <div>
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-300"
              >
                Tone
              </label>
              <select
                id="tone"
                name="tone"
                value={formData.tone}
                onChange={handleChange}
                disabled={generatingPost}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="thought-leadership">Thought Leadership</option>
                <option value="storytelling">Storytelling</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-300"
              >
                Keywords (comma separated)
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                disabled={generatingPost}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="E.g., innovation, leadership, technology"
              />
            </div>

            <button
              type="submit"
              disabled={generatingPost}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generatingPost ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                "Generate Post"
              )}
            </button>
          </form>
        </div>

        {/* Generated Posts */}
        <div className="bg-gray-800 px-4 py-5 rounded-lg shadow sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Posts</h2>
          <PostList />
        </div>
      </div>
    </div>
  );
}
