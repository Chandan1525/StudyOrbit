import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './src/models/Post.js'; // Path check karlein
import User from './src/models/User.js'; // Author assign karne ke liye

dotenv.config();

const seedPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Purane posts delete karein taaki fresh data aaye
    await Post.deleteMany({});

    // 2. Ek dummy user dhundein author banane ke liye
    // Agar user nahi hai, toh pehle login/signup karlein
    const user = await User.findOne();
    const authorId = user ? user._id : new mongoose.Types.ObjectId();

    const posts = [
      // --- MACHINE LEARNING (ML) ---
      {
        caption: "Explaining Neural Networks using simple analogies. #DeepLearning",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        orbit: "ML",
        hashtags: ["AI", "NeuralNetworks", "Python"],
        author: authorId
      },
      {
        caption: "Just finished training my first GAN model! 🤖",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4628c6bb5",
        orbit: "ML",
        hashtags: ["ML", "GenerativeAI"],
        author: authorId
      },
      {
        caption: "Scikit-learn vs TensorFlow: Which one to choose for beginners?",
        orbit: "ML",
        hashtags: ["DataScience", "Coding"],
        author: authorId
      },
      {
        caption: "Natural Language Processing is changing how we interact with machines.",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
        orbit: "ML",
        hashtags: ["NLP", "AI"],
        author: authorId
      },

      // --- WEB DEVELOPMENT (WEB) ---
      {
        caption: "Next.js 15 is insanely fast! Turbopack is a game changer.",
        image: "https://images.unsplash.com/photo-1618477247222-acbdb0e159b3",
        orbit: "WEB",
        hashtags: ["NextJS", "React", "WebDev"],
        author: authorId
      },
      {
        caption: "Tailwind CSS tips for better UI design. 🎨",
        orbit: "WEB",
        hashtags: ["Tailwind", "CSS", "Frontend"],
        author: authorId
      },
      {
        caption: "Building a scalable backend with Node.js and Redis.",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
        orbit: "WEB",
        hashtags: ["NodeJS", "Backend", "Performance"],
        author: authorId
      },
      {
        caption: "My portfolio website built with Framer Motion.",
        orbit: "WEB",
        hashtags: ["Portfolio", "Animation"],
        author: authorId
      },

      // --- APP DEVELOPMENT (APP) ---
      {
        caption: "Flutter vs React Native in 2026. What's your pick?",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
        orbit: "APP",
        hashtags: ["MobileDev", "Flutter", "Android"],
        author: authorId
      },
      {
        caption: "SwiftUI makes iOS development so much fun.",
        orbit: "APP",
        hashtags: ["iOS", "Swift", "Apple"],
        author: authorId
      },
      {
        caption: "Publishing my first app on Play Store today! 🚀",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3",
        orbit: "APP",
        hashtags: ["Launch", "MobileApp"],
        author: authorId
      },

      // --- CLOUD & DEVOPS ---
      {
        caption: "Dockerizing a MERN stack application step-by-step.",
        image: "https://images.unsplash.com/photo-1605745341112-85968b193ef5",
        orbit: "CLOUD",
        hashtags: ["Docker", "DevOps", "MERN"],
        author: authorId
      },
      {
        caption: "AWS Lambda vs Google Cloud Functions.",
        orbit: "CLOUD",
        hashtags: ["Serverless", "AWS", "Cloud"],
        author: authorId
      },
      {
        caption: "Kubernetes orchestration explained for five-year-olds.",
        image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9",
        orbit: "CLOUD",
        hashtags: ["K8s", "Infrastructure"],
        author: authorId
      },

      // --- DSA & CODING ---
      {
        caption: "Dynamic Programming is hard, but it's all about patterns.",
        orbit: "DSA",
        hashtags: ["DSA", "LeetCode", "Placement"],
        author: authorId
      },
      {
        caption: "Solved 500+ problems on LeetCode! Feeling confident.",
        image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea",
        orbit: "DSA",
        hashtags: ["CodingLife", "Achievement"],
        author: authorId
      },
      {
        caption: "Graph algorithms you MUST know for FAANG interviews.",
        orbit: "DSA",
        hashtags: ["Graphs", "InterviewPrep"],
        author: authorId
      }
    ];

    // Duplicate posts logic to reach 20 if needed
    await Post.insertMany(posts);
    console.log("✅ Successfully seeded 17+ unique posts across all topics!");
    process.exit();
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedPosts();