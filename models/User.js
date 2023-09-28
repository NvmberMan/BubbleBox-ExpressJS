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
    password: {
      type: String,
      required: "Password is required!",
    },
    status:{
      type: String,
      default: "Do not disturb"
    },
    image_url: {
      type: String,
      default: "https://assets-global.website-files.com/61c1e40ed7ebf4469f048f43/61f024b62c3343182aa3917e_Logo%20Design.jpeg"
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
