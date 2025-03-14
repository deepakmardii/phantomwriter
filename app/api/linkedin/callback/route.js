import { getAccessToken } from '@/utils/linkedin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LinkedInToken from '@/models/LinkedInToken';
import { cookies } from 'next/headers';
import dbConnect from '@/utils/db';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Get stored state from cookie
    const cookieStore = cookies();
    const storedState = cookieStore.get('linkedin_state')?.value;

    // Clear the state cookie
    const clearCookie =
      'linkedin_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax';

    if (error) {
      return new Response(JSON.stringify({ error: 'Authorization denied' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookie,
        },
      });
    }

    // Validate state to prevent CSRF attacks
    if (!state || !storedState || state !== storedState) {
      return new Response(JSON.stringify({ error: 'Invalid state parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookie,
        },
      });
    }

    if (!code) {
      return new Response(JSON.stringify({ error: 'No authorization code received' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookie,
        },
      });
    }

    // Exchange code for access token
    const tokenData = await getAccessToken(code);

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Save token to database
    await dbConnect();
    await LinkedInToken.findOneAndUpdate(
      { userId: session.user.id },
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    // Redirect to dashboard with success message
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearCookie,
      },
    });
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return new Response(JSON.stringify({ error: 'Failed to complete LinkedIn authorization' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
