const mongoose = require("mongoose");

const serverMessageSchema = new mongoose.Schema(
  {
    serverRoom: {
      type: mongoose.Schema.Types.ObjectId,
      required: "ServerRoom is required!",
      ref: "ServerRoom"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: "User is required!",
      ref: "User"
    },
    message:{
      type: String,
      required: "Message is required!"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServerMessage", serverMessageSchema);
