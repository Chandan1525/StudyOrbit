import Message from '../models/Message.js'; // Apna private message model check kar lena
import { encryptText, decryptText } from '../utils/cryptoHelper.js'; // 🔥 Encryption Import
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

    // 🔥 DECRYPT LOGIC: Frontend par bhejne se pehle wapas padhne layak banao
    const decryptedMessages = messages.map((msg) => {
      const doc = msg.toObject();
      if (doc.text) {
        doc.text = decryptText(doc.text); // Chhupe code ko wapas text mein badlo
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

    // 🔥 ENCRYPT LOGIC: Database mein save hone se pehle encrypt kar do
    const encryptedText = encryptText(text);

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: encryptedText, // 👈 Yahan Encrypted string jayegi DB mein
    });

    // 🔥 CHAT NOTIFICATION TRIGGER (NAYA CODE) 🔥
    // Check karte hain ki khud ko hi message na bhej rahe hon
    if (receiverId.toString() !== senderId.toString()) {
      await Notification.create({
        recipient: receiverId, // Jisko message bheja
        sender: senderId,      // Jisne message bheja
        type: "message"        // Notification ka type taaki UI usko chat icon de
      });
    }

    // Frontend par API response mein turant raw text bhejte hain taaki UI fast rahe
    const responseData = newMessage.toObject();
    responseData.text = text; 

    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};