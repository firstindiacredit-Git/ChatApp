import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: false,
  },
  messageType: {
    type: String,
    enum: ["text", "audio", "file"],
    required: true,
  },
  content: {
    type: String,
    validate: {
      validator: function (value) {
        return (
          this.messageType !== "text" || (value && value.trim().length > 0)
        );
      },
      message: "Text content is required for text messages.",
    },
  },
  audioUrl: {
    type: String,
    validate: {
      validator: function (value) {
        return (
          this.messageType !== "audio" || (value && value.trim().length > 0)
        );
      },
      message: "Audio URL is required for audio messages.",
    },
  },
  fileUrl: {
    type: String,
    validate: {
      validator: function (value) {
        return (
          this.messageType !== "file" || (value && value.trim().length > 0)
        );
      },
      message: "File URL is required for file messages.",
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Messages", messageSchema);
export default Message;
