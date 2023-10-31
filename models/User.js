const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: "Name is required",
    },
    email: {
      type: String,
      required: "Email is required!",
    },
    phone_number:{
      type: String,
    },
    password: {
      type: String,
      required: "Password is required!",
    },
    status:{
      type: String,
      default: "Online"
    },
    image_url: {
      type: String,
      default: "Bubble.jpg"
    },
    servers: [{
      _id: {
        type: String,
        ref: "ServerRoom",
      },
      name: {
        type: String
      }
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
