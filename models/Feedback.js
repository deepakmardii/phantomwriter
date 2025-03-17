import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['suggestion', 'bug', 'feature', 'other'],
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
