import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [
      function () {
        // Only require password for credentials provider and new documents
        return this.provider === 'credentials' || (!this.provider && this.isNew);
      },
      'Please provide a password',
    ],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  provider: {
    type: String,
    enum: ['credentials', 'google', 'dual'],
    default: 'credentials',
  },
  image: {
    type: String,
  },
  linkedinProfile: {
    type: String,
    required: false,
  },
  subscription: {
    status: {
      type: String,
      enum: ['free', 'trial', 'active', 'expired'],
      default: 'free',
    },
    expiresAt: {
      type: Date,
    },
    trialStartedAt: {
      type: Date,
    },
    trialEndsAt: {
      type: Date,
    },
    plan: {
      type: String,
      enum: ['none', 'monthly', 'yearly'],
      default: 'none',
    },
  },
  postUsage: {
    count: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
    monthlyLimit: {
      type: Number,
      default: 0, // No free credits
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
