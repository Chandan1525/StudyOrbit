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

    const imageUrl = req.file ? req.file.path : "";

    let encryptedText = "";
    if (text && text.trim() !== "") {
      encryptedText = encryptText(text);
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text: encryptedText, 
      image: imageUrl, 
    });

    // 🔥 CHAT NOTIFICATION TRIGGER
    if (receiverId.toString() !== senderId.toString()) {
      await Notification.create({
        recipient: receiverId, 
        sender: senderId,      
        type: "message"        
      });
    }

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

// 3. Private Message Edit karna
export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params; 
    const { text } = req.body;
    const senderId = req.user._id || req.user.id;

    const message = await Message.findOne({ _id: messageId, sender: senderId });
    if (!message) return res.status(404).json({ message: "Message not found or unauthorized" });

    message.text = encryptText(text);
    await message.save();

    res.status(200).json({ _id: message._id, text: text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Private Message Delete karna
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const senderId = req.user._id || req.user.id;

    const deletedMessage = await Message.findOneAndDelete({ _id: messageId, sender: senderId });
    if (!deletedMessage) return res.status(404).json({ message: "Message not found or unauthorized" });

    res.status(200).json({ message: "Message deleted successfully", _id: messageId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};