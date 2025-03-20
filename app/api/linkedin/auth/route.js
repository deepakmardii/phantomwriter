import { getAuthUrl } from '@/utils/linkedin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Generate a random state to prevent CSRF attacks
    const state = Math.random().toString(36).substring(7);

    // Get the authorization URL
    const authUrl = getAuthUrl(state);

    // Store state in a cookie for validation in callback
    const stateExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create cookie settings
    const cookieOptions = [
      `linkedin_state=${state}`,
      `Path=/`,
      `Expires=${stateExpiry.toUTCString()}`,
      `HttpOnly`,
      // Remove Secure flag since we're using HTTP
      `SameSite=Lax`,
      // Add domain for your EC2
      `Domain=13.126.32.219`,
    ].join('; ');

    return new Response(JSON.stringify({ url: authUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieOptions,
      },
    });
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    return new Response(JSON.stringify({ error: 'Failed to initialize LinkedIn auth' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
