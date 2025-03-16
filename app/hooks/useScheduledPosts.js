import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useScheduledPosts(refreshInterval = 300000) {
  // Check every 5 minutes
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;

    const checkScheduledPosts = async () => {
      try {
        const response = await fetch('/api/cron/post-scheduled', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Scheduled posts check:', result);

          // Debug log the response
          console.log('Scheduler response:', result);

          // Always refresh if we processed any posts
          if (result.results?.length > 0) {
            router.refresh();
          }
        }
      } catch (error) {
        console.error('Error checking scheduled posts:', error);
      }
    };

    // Initial check
    checkScheduledPosts();

    // Set up periodic checks
    const interval = setInterval(checkScheduledPosts, refreshInterval);

    return () => clearInterval(interval);
  }, [session, router, refreshInterval]);
}
