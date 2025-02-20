import Notification from "../models/notification.model";
import User from "../models/user.model";

export const pushNotification = async (req, res) => {
  try {
    const { receiverId, type, content, messageId } = req.body;
    const myId = req.user_id;

    const receiveUser = await User.findById(receiverId);
    if (receiveUser.inChatWith !== null && receiveUser.inChatWith === myId) {
      const newNotification = new Notification({
        senderId: myId,
        receiverId,
        type,
        content,
        messageId,
        relatedEntityType: "Message",
        status: "unread",
      });
      await newNotification.save();

      // const receiverSocketId = getReceiverSocketId(receiverId);
      // if (receiverSocketId) {
      //   io.to(receiverSocketId).emit("newNotification", newNotification);
      // }
    }

    res.status(201).json({ message: "Notification sent successfully" });
  } catch (error) {
    console.log("Error in pushNotification controller: " + error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { status } = req.params;
    const notifications = [];
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
