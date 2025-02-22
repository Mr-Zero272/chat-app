import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // User ID of the recipient (who will receive the notification)
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User collection
      required: true,
    },

    // Type of notification (e.g., "like", "comment", "message", "system")
    type: {
      type: String,
      required: true,
      enum: ["like", "comment", "message", "system", "follow", "other"], // Predefined types
    },

    title: {
      type: String,
      required: true,
    },

    // Content of the notification (can be a message or a reference to another document)
    content: {
      type: String,
      required: true,
    },

    // Reference to the related entity (e.g., postId, commentId, messageId)
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // Dynamic reference based on `relatedEntityType`
    },

    // Type of the related entity (e.g., "Post", "Comment", "Message")
    relatedEntityType: {
      type: String,
      enum: ["Post", "Comment", "Message", "User"], // Predefined related entity types
    },

    // Status of the notification (e.g., "unread", "read", "archived")
    status: {
      type: String,
      default: "unread",
      enum: ["unread", "read", "archived"],
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
