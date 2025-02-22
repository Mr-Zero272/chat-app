import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const createNotification = async (
  senderId,
  receiverId,
  type,
  title,
  content,
  messageId
) => {
  try {
    const receiveUser = await User.findById(receiverId);
    if (!receiveUser) return null;

    if (!receiveUser.inChatWith || receiveUser.inChatWith === null) {
      const newNotification = new Notification({
        senderId,
        receiverId,
        type,
        title,
        content,
        messageId,
        relatedEntityType: "Message",
        status: "unread",
      });
      const savedNotification = await newNotification.save();
      return savedNotification;
    }
    return null;
  } catch (error) {
    console.log("Error in createNotification: " + error);
    return null;
  }
};

export const pushNotification = async (req, res) => {
  try {
    const { receiverId, type, title, content, messageId } = req.body;
    const myId = req.user._id;
    const isNewNotificationCreated = await createNotification(
      myId,
      receiverId,
      type,
      title,
      content,
      messageId
    );
    if (isNewNotificationCreated) {
      res.status(201).json({ message: "Notification sent successfully" });
    } else {
      res.status(201).json({ message: "You are in the chat screen" });
    }
  } catch (error) {
    console.log("Error in pushNotification controller: " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { status } = req.params;
    let notifications = [];
    if (status) {
      notifications = await Notification.find({
        receiverId: req.user._id,
        status,
      })
        .populate("senderId", "username profilePic")
        .sort({ createdAt: -1 });
    } else {
      notifications = await Notification.find({ receiverId: req.user._id })
        .populate("senderId", "username profilePic")
        .sort({ createdAt: -1 });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications controller: " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateNotificationStatus = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: "read" },
      { new: true }
    );
    res.status(200).json(updatedNotification);
  } catch (error) {
    console.log("Error in updateNotificationStatus controller: " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
