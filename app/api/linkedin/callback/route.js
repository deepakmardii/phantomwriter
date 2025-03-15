import { getAccessToken } from '@/utils/linkedin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LinkedInToken from '@/models/LinkedInToken';
import { cookies } from 'next/headers';
import dbConnect from '@/utils/db';
import * as jose from 'jose';

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

    // Exchange code for tokens
    const tokenData = await getAccessToken(code);

    // Initialize userInfo variable
    let userInfo;

    try {
      // Set up JWKS for token verification
      const JWKS = jose.createRemoteJWKSet(new URL('https://www.linkedin.com/oauth/openid/jwks'));

      // Verify the token and get payload
      const { payload } = await jose.jwtVerify(tokenData.id_token, JWKS, {
        issuer: 'https://www.linkedin.com/oauth',
        audience: process.env.LINKEDIN_CLIENT_ID,
      });

      // Extract user info from verified payload
      userInfo = {
        sub: payload.sub,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
        email: payload.email,
        email_verified: payload.email_verified === 'true',
        locale: payload.locale,
      };
    } catch (error) {
      console.error('ID token validation error:', error);
      return new Response(JSON.stringify({ error: 'Invalid ID token' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearCookie,
        },
      });
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Save token and user info to database
    await dbConnect();
    await LinkedInToken.findOneAndUpdate(
      { userId: session.user.id },
      {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
        profile: userInfo,
      },
      { upsert: true, new: true }
    );

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
