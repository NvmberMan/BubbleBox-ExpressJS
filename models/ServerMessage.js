const mongoose = require("mongoose");

const serverMessageSchema = new mongoose.Schema(
  {
    server_id: {
      type: String,
      required: "ServerRoom is required!",
    },
    user_id: {
      type: String,
      required: "User is required!",
    },
    message:{
      type: String,
      required: "Message is required!"
    },
    readed: [
      {
        user_id: {
          type: String,
          required: "User id is required"
        },
        user_name: {
          type: String,
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServerMessage", serverMessageSchema);
