import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/utils/db';
import User from '@/models/User';
import LinkedInToken from '@/models/LinkedInToken';

export async function POST(request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the LinkedIn token
    await LinkedInToken.deleteOne({ user: user._id });

    return NextResponse.json({ success: true, message: 'LinkedIn disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting LinkedIn:', error);
    return NextResponse.json({ error: 'Failed to disconnect LinkedIn account' }, { status: 500 });
  }
}
