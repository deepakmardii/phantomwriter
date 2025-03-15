import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import connectDB from '@/utils/db';

export async function authenticate(request) {
  try {
    // Get token from header
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'No token, authorization denied',
        }),
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Connect to database
    await connectDB();

    // Get user from database (NextAuth stores user ID in sub or id field)
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return new NextResponse(JSON.stringify({ success: false, message: 'User not found' }), {
        status: 404,
      });
    }

    if (user.subscription.status === 'expired') {
      return new NextResponse(JSON.stringify({ success: false, message: 'Subscription expired' }), {
        status: 403,
      });
    }

    // Add user to request
    request.user = user;

    return request;
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false, message: 'Token is not valid' }), {
      status: 401,
    });
  }
}

export function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}
