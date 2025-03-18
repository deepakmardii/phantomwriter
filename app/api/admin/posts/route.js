import { withAdminAuth } from '@/middleware/adminAuth';
import Post from '@/models/Post';
import dbConnect from '@/utils/db';

// GET all posts
export const GET = withAdminAuth(async req => {
  try {
    await dbConnect();
    const posts = await Post.find({}).populate('user', 'name email');
    return new Response(JSON.stringify(posts), {
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

// PUT update post
export const PUT = withAdminAuth(async req => {
  try {
    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;

    const post = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    return new Response(JSON.stringify(post), {
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

// DELETE post
export const DELETE = withAdminAuth(async req => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await Post.findByIdAndDelete(id);
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
