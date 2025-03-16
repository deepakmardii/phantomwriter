import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/models/User';
import { generateToken } from '@/middleware/auth';

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password, linkedinProfile } = await request.json();

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json({ success: false, message: 'User already exists' }, { status: 400 });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      linkedinProfile,
      subscription: {
        status: 'free',
      },
      postUsage: {
        count: 0,
        monthlyLimit: 50,
        lastResetDate: new Date(),
      },
    });

    // Generate token
    const token = generateToken(user._id);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        linkedinProfile: user.linkedinProfile,
        subscription: user.subscription,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
