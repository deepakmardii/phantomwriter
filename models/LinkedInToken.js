import mongoose from 'mongoose';

const linkedInTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add method to check if token is expired
linkedInTokenSchema.methods.isExpired = function () {
  return new Date() >= this.expiresAt;
};

export default mongoose.models.LinkedInToken ||
  mongoose.model('LinkedInToken', linkedInTokenSchema);
