import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary with your .env credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Setup Multer Storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat_images", 
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"],
    // 🔥 Tell Cloudinary to automatically convert ALL images (especially iPhone HEIC) to standard JPG
    format: "jpg", 
  },
});

const upload = multer({ storage });

export default upload;