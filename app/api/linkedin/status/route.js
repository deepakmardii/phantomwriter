import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LinkedInToken from '@/models/LinkedInToken';
import dbConnect from '@/utils/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    await dbConnect();
    const linkedInToken = await LinkedInToken.findOne({ userId: session.user.id });

    return new Response(
      JSON.stringify({
        isConnected: !!linkedInToken,
        isExpired: linkedInToken ? linkedInToken.isExpired() : null,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('LinkedIn status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get LinkedIn connection status' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
