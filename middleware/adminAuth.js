import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/utils/db';

export async function adminAuth(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return { success: false, message: 'Not authenticated' };
  }

  // Get user from database
  const user = await User.findOne({ email: session.user.email });

  if (!user || user.role !== 'admin') {
    return { success: false, message: 'Not authorized as admin' };
  }

  return { success: true, user };
}

// Middleware wrapper for API routes
export function withAdminAuth(handler) {
  return async (req, res) => {
    const authResult = await adminAuth(req);

    if (!authResult.success) {
      return new Response(JSON.stringify({ error: authResult.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Add user to req object
    req.user = authResult.user;
    return handler(req, res);
  };
}
