const mongoose = require("mongoose");

const TokenBlackList = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // Pastikan token hanya bisa disimpan satu kali
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "tokenBlacklist", // Nama koleksi (collection) di database
  }
);

module.exports = mongoose.model("TokenBlackList", TokenBlackList);
