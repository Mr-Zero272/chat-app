import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { updateInChatWithInfo } from "./auth.controller.js";
import { createNotification } from "./notification.controller.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    await updateInChatWithInfo(myId, userToChatId);

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const exitChat = async (req, res) => {
  try {
    const myId = req.user._id;
    await updateInChatWithInfo(myId, null);
    res.status(200).json({ message: "Chat exited successfully" });
  } catch (error) {
    console.log("Error in exitChat: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;

    const senderId = req.user._id;
    const senderName = req.user.fullName;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const savedMessage = await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);

    const newNotification = await createNotification(
      senderId,
      receiverId,
      "message",
      "You have a message from " + senderName,
      newMessage.text,
      savedMessage._id
    );
    if (newNotification) {
      // emit notification through socket
      if (receiverSocketId) {
        console.log("send notification");
        io.to(receiverSocketId).emit("newNotification", newNotification);
      }
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
