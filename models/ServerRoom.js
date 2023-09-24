const mongoose = require("mongoose");

const serverRoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: "room id required!",
    },
    description: {
      type: String,
      default: "Ini Deskripsi"
    },
    tag_line :{
      type: String,
      default: "Server Tagline"
    },
    image_url: {
      type: String,
      default: "https://asset.kompas.com/crops/3Fs4i0nalLcEOHaiKO_TqtBueMM=/431x76:1349x689/750x500/data/photo/2023/07/24/64be1b4a76292.jpg"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ServerRoom", serverRoomSchema);
