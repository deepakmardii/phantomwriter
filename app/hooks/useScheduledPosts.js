import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const DEV_INTERVAL = 60000; // 1 minute in development
const PROD_INTERVAL = 300000; // 5 minutes in production

/**
 * Hook for handling scheduled posts checking
 * - In development: Checks every minute to help with testing
 * - In production: Checks every 5 minutes as a fallback
 *   (primary scheduling handled by Vercel Cron)
 */
export function useScheduledPosts() {
  const refreshInterval = process.env.NODE_ENV === 'development' ? DEV_INTERVAL : PROD_INTERVAL;
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
