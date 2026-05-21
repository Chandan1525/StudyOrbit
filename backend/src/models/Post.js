import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text:    { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    caption: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 2000,
    },
    orbit: {
      type:    String,
      default: "GENERAL",
      enum:    ["WEB", "APP", "ML", "DSA", "CLOUD", "HACK", "BLOCKCHAIN", "GENERAL"],
      uppercase: true,
    },
    hashtags: {
      type:    [String],
      default: [],
    },
    image: {
      type:    String,
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "User",
      },
    ],
    comments: [commentSchema],
    shares: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ caption: "text", hashtags: "text" });

const Post = mongoose.model("Post", postSchema);
export default Post;