import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LinkedInToken from '@/models/LinkedInToken';
import { createPost, refreshAccessToken } from '@/utils/linkedin';
import dbConnect from '@/utils/db';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const content = formData.get('content');
    const image = formData.get('image');

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    let imageBuffer;
    let imageType;
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageType = image.type;
    }

    await dbConnect();
    let linkedInToken = await LinkedInToken.findOne({ userId: session.user.id });

    if (!linkedInToken) {
      return new Response(JSON.stringify({ error: 'LinkedIn account not connected' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if token is expired and refresh if needed
    if (linkedInToken.isExpired()) {
      try {
        const newTokenData = await refreshAccessToken(linkedInToken.refreshToken);
        const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);

        linkedInToken = await LinkedInToken.findOneAndUpdate(
          { userId: session.user.id },
          {
            accessToken: newTokenData.access_token,
            refreshToken: newTokenData.refresh_token,
            expiresAt,
          },
          { new: true }
        );
      } catch (error) {
        console.error('Token refresh error:', error);
        return new Response(JSON.stringify({ error: 'Failed to refresh LinkedIn token' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Create post on LinkedIn with image if provided
    const result = await createPost(linkedInToken.accessToken, content, imageBuffer, imageType);

    return new Response(JSON.stringify({ success: true, postId: result.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('LinkedIn post error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create LinkedIn post' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
