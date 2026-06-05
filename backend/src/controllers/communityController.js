import CommunityMessage from '../models/CommunityMessage.js';
import { encryptText, decryptText } from '../utils/cryptoHelper.js';

// 1. Purane messages fetch karna (Refresh ke baad)
export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const messages = await CommunityMessage.find({ communityId }).sort({ createdAt: 1 });
    
    // 🔥 DECRYPT LOGIC: Sirf tab decrypt karo jab text ho
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

// 2. Naya message save karna
export const saveCommunityMessage = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { text } = req.body;

    // 🔥 1. Multer ne image upload kardi hogi, Cloudinary URL yahan se milega
    const imageUrl = req.file ? req.file.path : "";
    
    // 🔥 2. ENCRYPT LOGIC: Sirf tabhi encrypt karo agar user ne text likha hai
    let encryptedText = "";
    if (text && text.trim() !== "") {
      encryptedText = encryptText(text);
    }

    const newMessage = await CommunityMessage.create({
      communityId,
      user: req.user.name || req.user.username || "Student",
      role: "Member", 
      text: encryptedText, 
      image: imageUrl, // 🔥 3. Yahan Cloudinary ka URL save ho jayega
      time: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }),
      avatar: (req.user.name || req.user.username || "S").charAt(0).toUpperCase(),
      color: "bg-indigo-500" 
    });

    const responseData = newMessage.toObject();
    if (text) {
      responseData.text = text; 
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error("Save Message Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Message Edit/Update karna
export const updateCommunityMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    
    let encryptedText = "";
    if (text && text.trim() !== "") {
      encryptedText = encryptText(text);
    }

    const updatedMsg = await CommunityMessage.findByIdAndUpdate(
      messageId, 
      { text: encryptedText },
      { new: true }
    );

    const responseData = updatedMsg.toObject();
    if (text) {
      responseData.text = text; 
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Message Delete karna
export const deleteCommunityMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    await CommunityMessage.findByIdAndDelete(messageId);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { id: communityId } = req.params;
    
    // Auth middleware verify karke req.user dega
    const userId = req.user._id || req.user.id; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Please login first." });
    }

    // Community fetch and update logic
    // This assumes you have a Community model maintaining a 'members' array
    const updatedCommunity = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } }, // Duplicates ko avoid karega
      { new: true }
    );

    if (!updatedCommunity) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.status(200).json({ message: "Successfully joined community", community: updatedCommunity });

  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};