import { withAdminAuth } from '@/middleware/adminAuth';
import User from '@/models/User';
import dbConnect from '@/utils/db';

// GET all users
export const GET = withAdminAuth(async req => {
  try {
    await dbConnect();
    const users = await User.find({}).select('-password');
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// PUT update user
export const PUT = withAdminAuth(async req => {
  try {
    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;

    // Don't allow role update if user is admin to prevent removing last admin
    if (updateData.role) {
      const user = await User.findById(id);
      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount === 1) {
          return new Response(JSON.stringify({ error: 'Cannot remove last admin' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// DELETE user
export const DELETE = withAdminAuth(async req => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Check if user is admin
    const user = await User.findById(id);
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return new Response(JSON.stringify({ error: 'Cannot delete last admin' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    await User.findByIdAndDelete(id);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
