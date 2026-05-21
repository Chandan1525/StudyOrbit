import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// THIS WILL TEST YOUR CONNECTION ON STARTUP
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Nodemailer Error: Cannot connect to Gmail.");
    console.log(error.message);
  } else {
    console.log("✅ Nodemailer is ready to send emails!");
  }
});

export default transporter;