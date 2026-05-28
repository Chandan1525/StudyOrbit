import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, default: "" }, // Made optional
  image: { type: String, default: "" }, // Added image field
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);