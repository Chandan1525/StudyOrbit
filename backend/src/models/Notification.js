import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisko notification jayegi
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisne action kiya
  type: { type: String, enum: ['like', 'comment', 'follow', 'message'], required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Agar post pe like/comment hai toh
  text: { type: String }, // Agar comment ya message hai toh uska text
  read: { type: Boolean, default: false } // Check karne ke liye ki padh liya ya nahi
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);