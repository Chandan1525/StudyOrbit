import { Resend } from 'resend';
import dotenv from "dotenv";

dotenv.config();

// Sirf API Key chahiye, SMTP ka koi jhanjhat nahi!
export const resend = new Resend(process.env.RESEND_API_KEY);