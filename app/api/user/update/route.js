import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import { dbConnect } from '@/utils/db';

export async function PUT(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    const data = await req.json();

    // Get user with password field
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return Response.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Handle password update
    if (data.currentPassword && data.newPassword) {
      // Verify current password
      const isMatch = await user.matchPassword(data.currentPassword);
      if (!isMatch) {
        return Response.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Update password
      user.password = data.newPassword;
      await user.save();

      return Response.json({
        success: true,
        message: 'Password updated successfully',
      });
    }

    // Handle name update
    if (data.name) {
      if (!data.name.trim()) {
        return Response.json({ success: false, message: 'Name cannot be empty' }, { status: 400 });
      }

      user.name = data.name;
      await user.save();

      return Response.json({
        success: true,
        message: 'Name updated successfully',
        user: {
          name: user.name,
          email: user.email,
        },
      });
    }

    return Response.json(
      { success: false, message: 'No valid update parameters provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ success: false, message: 'Error updating user' }, { status: 500 });
  }
}
