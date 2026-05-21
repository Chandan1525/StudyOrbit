import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },

    // ── Profile fields ──────────────────────────────────────
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    skills: { type: [String], default: [] },
    website: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    coverGradient: { type: String, default: "" },

    // ── OTP / Auth ──────────────────────────────────────────
    otp: { type: String },
    otpExpire: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // 🔥 NEW: Session Tracking for Connected Devices
    sessions: [
      {
        sessionId: { type: String, required: true },
        device: { type: String, default: "Unknown Device" },
        ip: { type: String, default: "Unknown IP" },
        loginTime: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;