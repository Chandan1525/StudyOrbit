import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/mail.js";
import twilio from "twilio";
import crypto from "crypto"; // 🔥 NEW: For unique Session IDs
import { resend } from "../config/resend.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Helper: generate JWT ──────────────────────────────────────────────
// 🔥 FIX: Token ab sessionId ko bhi apne andar carry karega
const generateToken = (userId, sessionId) => {
  return jwt.sign(
    { id: userId, sessionId: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ── Helper: safe user object ─────────────────
const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  mobile: user.mobile,
  bio: user.bio || user.about || "", 
  skills: user.skills || [],
  avatar: user.avatar || "",
  location: user.location || "",
  website: user.website || "",
  github: user.github || "",
  linkedin: user.linkedin || "",
  coverGradient: user.coverGradient || "",
});

await resend.emails.send({
  from: 'StudyOrbit <onboarding@resend.dev>', // Resend ka default domain hai
  to: userEmail, // User ka email
  subject: 'Your StudyOrbit OTP',
  html: `<p>Your verification OTP is: <strong>${otp}</strong></p>`
});

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // 🔥 CREATE UNIQUE SESSION INFO
    const sessionId = crypto.randomUUID();
    const device = req.headers["user-agent"] || "Unknown Device";
    const ip = req.ip || req.connection.remoteAddress || "Unknown IP";

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        name: name, 
        username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000), 
        email: email,
        password: randomPassword,
        isOtpVerified: true, 
        mobile: "0000000000", 
        avatar: picture,
        sessions: [{ sessionId, device, ip }] // Save initial session
      });
    } else {
      user.sessions.push({ sessionId, device, ip }); // Add new session
      await user.save();
    }

    const token = generateToken(user._id, sessionId);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: safeUser(user) 
    });

  } catch (error) {
    console.error("❌ Google Login Error:", error.message); 
    res.status(400).json({ success: false, message: error.message || "Google Login Failed" });
  }
};

export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const username = req.body.username?.trim().toLowerCase();
    const email = req.body.email?.trim().toLowerCase();
    const mobile = req.body.mobile?.trim();
    const password = req.body.password;

    if (!name || !username || !email || !mobile || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ success: false, message: "Invalid username." });
    }
    
    // Check duplicates
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered." });
    if (await User.findOne({ username })) return res.status(409).json({ success: false, message: "Username taken." });

    const hashedPassword = await bcrypt.hash(password, 12);

    // 🔥 CREATE UNIQUE SESSION INFO
    const sessionId = crypto.randomUUID();
    const device = req.headers["user-agent"] || "Unknown Device";
    const ip = req.ip || req.connection.remoteAddress || "Unknown IP";

    const user = await User.create({
      name, username, email, mobile, password: hashedPassword,
      sessions: [{ sessionId, device, ip }] // First session saved
    });

    const token = generateToken(user._id, sessionId);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const loginUser = async (req, res) => {
  try {
    const identifier = req.body.identifier?.trim().toLowerCase();
    const password = req.body.password;

    if (!identifier || !password) return res.status(400).json({ success: false, message: "Credentials required." });

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }, { mobile: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // 🔥 CREATE UNIQUE SESSION INFO
    const sessionId = crypto.randomUUID();
    const device = req.headers["user-agent"] || "Unknown Device";
    const ip = req.ip || req.connection.remoteAddress || "Unknown IP";

    user.sessions.push({ sessionId, device, ip });
    await user.save();

    const token = generateToken(user._id, sessionId);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, user: safeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  PASSWORD RESET FLOW
// ─────────────────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const cleanIdentifier = identifier?.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { mobile: cleanIdentifier },
        { username: cleanIdentifier }
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 5 * 60 * 1000;

    await User.findByIdAndUpdate(user._id, { otp: otp, otpExpire: otpExpire });

    const isMobileInput = /^[0-9]{10}$/.test(cleanIdentifier);

    if (isMobileInput) {
      console.log(`Preparing to send SMS to ${user.mobile}...`);
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your StudyOrbit password reset OTP is ${otp}. It is valid for 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${user.mobile}` 
        });
        console.log(`✅ SMS sent successfully to ${user.mobile}`);
      } else {
        console.log(`⚠️ TWILIO KEYS MISSING: Pretend SMS was sent with OTP: ${otp}`);
      }
      return res.status(200).json({ success: true, message: "OTP sent successfully to your mobile number." });
    } else {
      console.log(`Preparing to send Email to ${user.email}...`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "StudyOrbit Password Reset OTP",
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
              <h2>StudyOrbit Password Reset</h2>
              <p>Your OTP is:</p>
              <h1 style="color: #e11d48; letter-spacing: 5px;">${otp}</h1>
              <p>This OTP expires in 5 minutes.</p>
          </div>
        `,
      });
      console.log(`✅ Email sent successfully to ${user.email}`);
      return res.status(200).json({ success: true, message: "OTP sent successfully to your email address." });
    }
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error while sending OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const cleanIdentifier = identifier?.trim().toLowerCase();
    const cleanOtp = otp?.trim();

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier },
        { mobile: cleanIdentifier },
        { username: cleanIdentifier }
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.otp !== cleanOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    user.isOtpVerified = true;
    await user.save();

    res.status(200).json({ success: true, message: "OTP verified successfully. You may now reset your password." });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier?.trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanIdentifier }, 
        { mobile: cleanIdentifier },
        { username: cleanIdentifier } 
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.isOtpVerified) {
      return res.status(400).json({ success: false, message: "OTP verification is required before resetting password." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    user.otp = undefined;
    user.otpExpire = undefined;
    user.isOtpVerified = false;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful! You can now log in." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  UPDATE PROFILE (BULLETPROOF VERSION)
// ─────────────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    let userId = req.user?.id || req.user?._id;
    if (!userId && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    }
    if (!userId) return res.status(401).json({ message: "Not authorized." });

    const { name, username, location, bio, about, avatar, skills, website, github, linkedin, coverGradient } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, username, location, bio: bio || about, avatar, skills, website, github, linkedin, coverGradient } },
      { new: true, runValidators: true } 
    ).select('-password'); 

    res.status(200).json({ message: "Profile updated successfully", user: safeUser(updatedUser) });
  } catch (error) {
    console.error("🚨 CRASH IN UPDATE PROFILE:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};