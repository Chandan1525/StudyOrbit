import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns"; // 👈 Ye NAYA import hai

dotenv.config();

// 🔥 Node.js ko strictly IPv4 use karne bolo (IPv6 wala network error fix karne ke liye)
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // 👈 'service: "gmail"' ki jagah proper host use karenge
  port: 587,              // 👈 Cloud ke liye safe port
  secure: false,          // 👈 587 port ke liye false hona chahiye
  requireTLS: true,       // 👈 Extra security ke liye
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