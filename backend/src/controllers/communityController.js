import CommunityMessage from '../models/CommunityMessage.js';
import { encryptText, decryptText } from '../utils/cryptoHelper.js'; // 🔥 Naya Import

// 1. Purane messages fetch karna (Refresh ke baad)
export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    // Puraane messages chronological order mein nikalo
    const messages = await CommunityMessage.find({ communityId }).sort({ createdAt: 1 });
    
    // 🔥 DECRYPT LOGIC: Frontend par bhejne se pehle wapas padhne layak banao
    const decryptedMessages = messages.map((msg) => {
      const doc = msg.toObject();
      if (doc.text) {
        doc.text = decryptText(doc.text); // Chhupe code ko text mein badlo
      }
      return doc;
    });

    res.status(200).json(decryptedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Naya message save karna
export const saveCommunityMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { text } = req.body;
    
    // 🔥 ENCRYPT LOGIC: Database mein save hone se pehle encrypt kar do
    const encryptedText = encryptText(text);

    // Frontend jaisa UI dikhata hai, waisa hi data save karo
    const newMessage = await CommunityMessage.create({
      communityId,
      user: req.user.name || req.user.username || "Student",
      role: "Member", 
      text: encryptedText, // 👈 Yahan Encrypted string jayegi
      time: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
      avatar: (req.user.name || req.user.username || "S").charAt(0).toUpperCase(),
      color: "bg-indigo-500" 
    });

    // Frontend par API response mein turant raw text bhejte hain taaki UI fast aur clear rahe
    const responseData = newMessage.toObject();
    responseData.text = text; 

    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Message Edit/Update karna
export const updateCommunityMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    
    // 🔥 ENCRYPT LOGIC: Edit kiye hue naye text ko bhi encrypt karo
    const encryptedText = encryptText(text);

    // DB mein message find karke text update kar do
    const updatedMsg = await CommunityMessage.findByIdAndUpdate(
      messageId, 
      { text: encryptedText }, // 👈 Yahan bhi Encrypted string jayegi
      { new: true }
    );

    const responseData = updatedMsg.toObject();
    responseData.text = text; // Response mein normal text bhejo

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Message Delete karna (Isme text ki zaroorat nahi hoti)
export const deleteCommunityMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await CommunityMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};