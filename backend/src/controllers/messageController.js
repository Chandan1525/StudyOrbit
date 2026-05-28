import Message from '../models/Message.js';
import { encryptText, decryptText } from '../utils/cryptoHelper.js';
import Notification from "../models/Notification.js";

// 1. Private Messages Fetch karna
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id || req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userToChatId },
        { sender: userToChatId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    // 🔥 DECRYPT LOGIC
    const decryptedMessages = messages.map((msg) => {
      const doc = msg.toObject();
      // Only decrypt if there is actually text
      if (doc.text && doc.text.trim() !== "") {
        doc.text = decryptText(doc.text); 
      }
      return doc;
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Private Message Save karna
export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id || req.user.id;

    // 🔥 If a file was uploaded, Multer attaches it to req.file. 
    // Cloudinary automatically returns the live URL in req.file.path
    const imageUrl = req.file ? req.file.path : "";

    // 🔥 ENCRYPT LOGIC: Only encrypt if text was actually sent
    let encryptedText = "";
    if (text && text.trim() !== "") {
      encryptedText = encryptText(text);
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: encryptedText, 
      image: imageUrl, // 👈 Save the Cloudinary URL to DB
    });

    // 🔥 CHAT NOTIFICATION TRIGGER
    if (receiverId.toString() !== senderId.toString()) {
      await Notification.create({
        recipient: receiverId, 
        sender: senderId,      
        type: "message"        
      });
    }

    // Frontend par API response mein turant raw text bhejte hain
    const responseData = newMessage.toObject();
    if (text) {
      responseData.text = text; 
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({ message: error.message });
  }
};