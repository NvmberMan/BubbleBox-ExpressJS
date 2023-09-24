const mongoose = require("mongoose");
const ServerRoom = mongoose.model("ServerRoom");
const User = mongoose.model("User");

exports.getAllServerRoom = async (req, res) => {
  const payload = req.payload;
  const serverrooms = await ServerRoom.find();
  res.json({
    message: "Successfully get all server room",
    data: serverrooms,
  });
};

exports.getAllServerRoomByPerUser = async (req, res) => {
  const payload = req.payload;
  const user = await User.findById(payload.id);
  const serversInUser = user.servers;
  const servers = [];

  // Menggunakan Promise.all untuk menunggu semua operasi async selesai
  await Promise.all(
    serversInUser.map(async (data) => {
      const server = await ServerRoom.findOne({ _id: data._id });
      servers.push(server);
    })
  );

  res.json({
    user_id: user._id,
    user_name: user.username,
    user_image: user.image_url,
    server_data: servers,
  });
};

exports.createServerRoom = async (req, res) => {
  const payload = req.payload;
  const { name, tag_line, description } = req.body;

  if (!name) throw "Name Server is Required!";

  const serverroom = new ServerRoom({
    name,
    tag_line: tag_line || "Server Tagline",
    description: description || "Server Description",
  });

  await serverroom.save();

  // Dapatkan ID server room yang baru dibuat
  const newServerRoomId = serverroom._id;

  // Mendapatkan dokumen pengguna berdasarkan ID
  const user = await User.findById(payload.id);

  // Memeriksa apakah user ditemukan
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Menambahkan ID server room baru ke dalam array "servers"
  user.servers.push({
    _id: newServerRoomId,
    name: name,
  });

  // Menyimpan perubahan pada dokumen pengguna
  await user.save();

  res.json({
    message: "Serverroom created!",
    data: serverroom,
  });
};

exports.leaveServerRoom = async (req, res) => {
  const payload = req.payload;
  const { server_id } = req.body;

  if (!server_id) throw "server id required";

  const findServer = await ServerRoom.findOne({ _id: server_id });
  if (!findServer) throw "Server Id " + server_id + " Not Found";

  //check server member if more than 1 we LEAVE
  const usersOnThisServer = await User.find({ "servers._id": server_id });
  if (usersOnThisServer.length > 1) {
    // Jika lebih dari satu pengguna, maka pengguna akan meninggalkan server
    throw "This server has more than one member, so it cannot be deleted.";
  }

  await User.updateMany(
    { _id: { $in: usersOnThisServer.map((user) => user._id) } },
    { $pull: { servers: { _id: server_id } } }
  );

  // Hapus pesan yang terkait dengan server yang dihapus
  // await ServerMessage.deleteMany({ serverRoom: server_id });

  // Hapus server dari koleksi ServerRoom
  await ServerRoom.deleteOne({ _id: server_id });

  res.json({
    message: "You left the server and the server has been deleted.",
  });

//   res.json({
//     tes: findServer,
//     a: usersOnThisServer,
//   });
};
