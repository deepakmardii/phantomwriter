import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import LinkedInToken from '@/models/LinkedInToken';
import dbConnect from '@/utils/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const linkedInToken = await LinkedInToken.findOne({ user: session.user.id });

    // Debug log
    console.log('LinkedIn status check:', {
      userId: session.user.id,
      hasToken: !!linkedInToken,
      tokenData: linkedInToken
        ? {
            accessToken: !!linkedInToken.accessToken,
            createdAt: linkedInToken.createdAt,
          }
        : null,
    });

    const isConnected = !!linkedInToken?.accessToken;
    const isExpired = linkedInToken?.isExpired?.() || false;

    return NextResponse.json({
      isConnected,
      isExpired,
    });
  } catch (error) {
    console.error('LinkedIn status error:', error);
    return NextResponse.json(
      { error: 'Failed to get LinkedIn connection status' },
      { status: 500 }
    );
  }
}
