'use client';

import { useScheduledPosts } from '../hooks/useScheduledPosts';

export default function ScheduledPostsHandler() {
  // Initialize the scheduled posts checker
  useScheduledPosts();

  // This component doesn't render anything
  return null;
}
