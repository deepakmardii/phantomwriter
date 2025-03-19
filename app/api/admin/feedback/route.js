import { withAdminAuth } from '@/middleware/adminAuth';
import Feedback from '@/models/Feedback';
import dbConnect from '@/utils/db';

// GET all feedback
export const GET = withAdminAuth(async _req => {
  try {
    await dbConnect();
    const feedback = await Feedback.find({}).populate('userId', 'name email');
    return new Response(JSON.stringify(feedback), {
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

// PUT update feedback (e.g., mark as resolved)
export const PUT = withAdminAuth(async req => {
  try {
    await dbConnect();
    const data = await req.json();
    const { id, ...updateData } = data;

    const feedback = await Feedback.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email');

    return new Response(JSON.stringify(feedback), {
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

// DELETE feedback
export const DELETE = withAdminAuth(async req => {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    await Feedback.findByIdAndDelete(id);
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
