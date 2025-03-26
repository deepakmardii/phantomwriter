import { NextResponse } from 'next/server';
import { authenticate } from '@/middleware/auth';
import dbConnect from '@/utils/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    const authRequest = await authenticate(request);
    if (authRequest instanceof NextResponse) {
      return authRequest;
    }

    await dbConnect();
    const user = await User.findById(authRequest.user._id);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      subscription: user.subscription,
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
