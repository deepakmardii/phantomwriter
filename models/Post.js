import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    maxlength: [3000, "Post cannot be more than 3000 characters"],
  },
  topic: {
    type: String,
    required: [true, "Topic is required"],
  },
  tone: {
    type: String,
    enum: ["professional", "casual", "thought-leadership", "storytelling"],
    default: "professional",
  },
  keywords: [
    {
      type: String,
    },
  ],
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  linkedinPostId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  metrics: {
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
  },
});

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

export default Post;
