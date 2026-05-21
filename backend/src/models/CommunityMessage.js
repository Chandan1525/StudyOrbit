import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema({
  communityId: { type: String, required: true }, // Jaise: 'ai-ml', 'web-dev'
  user: { type: String, required: true }, // Jisne bheja
  role: { type: String, default: "Member" },
  text: { type: String, required: true },
  time: { type: String },
  avatar: { type: String },
  color: { type: String }
}, { timestamps: true });

export default mongoose.model("CommunityMessage", communityMessageSchema);