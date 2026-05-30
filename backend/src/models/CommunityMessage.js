import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema({
  communityId: { type: String, required: true }, // Jaise: 'ai-ml', 'web-dev'
  user: { type: String, required: true }, // Jisne bheja
  role: { type: String, default: "Member" },
  text: { type: String, default: "" }, // 🔥 Required hata diya taaki sirf image bhi bhej sakein
  image: { type: String, default: "" }, // 🔥 Naya image URL field
  time: { type: String },
  avatar: { type: String },
  color: { type: String }
}, { timestamps: true });

export default mongoose.model("CommunityMessage", communityMessageSchema);