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
    profile: {
      sub: String,
      name: String,
      given_name: String,
      family_name: String,
      picture: String,
      email: String,
      email_verified: Boolean,
      locale: String,
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
