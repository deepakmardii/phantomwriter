import { getServerSession } from 'next-auth';
import Feedback from '../../../../models/Feedback';
import dbConnect from '@/utils/db';

export async function POST(request) {
  try {
    const session = await getServerSession();
    const { type, subject, description, email } = await request.json();

    // Validate required fields
    if (!type || !subject || !description) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await dbConnect();

    const feedback = await Feedback.create({
      type,
      subject,
      description,
      email,
      userId: session?.user?.id || null,
    });

    return new Response(
      JSON.stringify({
        message: 'Feedback submitted successfully',
        feedback,
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to submit feedback',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
