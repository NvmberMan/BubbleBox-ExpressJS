const mongoose = require("mongoose");
const ServerRoom = mongoose.model("ServerRoom");
const User = mongoose.model("User");
const ServerMessage = mongoose.model("ServerMessage");

exports.sendMessage = async (req, res) => {
  const payload = req.payload;
  const { server_id, message } = req.body;

  if (server_id == null) throw "Server id is required";
  if (message == null) throw "Message is required";

  const serverrooms = await ServerRoom.findOne({ _id: server_id });
  if (!serverrooms) throw "Server not found";

  await ServerMessage.create({
    server_id: server_id,
    user_id: payload.id,
    message: message,
  });

  const user = await User.findOne({ _id: payload.id });
  if (!user) throw new Error("User not found");

  const indexToMove = user.servers.findIndex(
    (server) => server._id === server_id
  );

  // CHECK IF ELEMENT IS FOUNDED
  if (indexToMove === -1) {
    throw new Error("ServerRoom not found in user's servers " + indexToMove);
  }
  const serverRoomToMove = user.servers[indexToMove];
  user.servers.splice(indexToMove, 1);
  user.servers.unshift(serverRoomToMove);
  await user.save();

  res.json({
    message: "Success Send Message",
  });
};

exports.getAllData = async (req, res) => {
  const payload = req.payload;
  const user = await User.findById(payload.id);
  const serversInUser = user.servers;
  const servers = [];

  // Menggunakan Promise.all untuk menunggu semua operasi async selesai
  await Promise.all(
    serversInUser.map(async (data) => {
      const server = await ServerRoom.findOne({ _id: data._id }).select(
        "-members"
      );
      const message = await ServerMessage.find({ server_id: data._id }).select(
        "-server_id -createdAt -updatedAt -__v"
      );
      const newMessage = [];

      // Gunakan Promise.all untuk menunggu semua operasi async dalam map kedua selesai
      await Promise.all(
        message.map(async (m) => {
          const userMessage = await User.findOne({ _id: m.user_id }).select(
            "-email -password -createdAt -updatedAt -servers -status -__v"
          );
          newMessage.push({
            _id: m._id,
            user_id: userMessage._id,
            user_name: userMessage.username,
            user_image: userMessage.image_url,
            readed: m.readed,
            message: m.message,
          });
        })
      );

      const sortedMessage = message.map((d) => {
        const mes = newMessage.find(
          (s) => s._id.toString() === d._id.toString()
        );
        return mes;
      });

      servers.push({
        _id: server._id,
        name: server.name,
        description: server.description,
        tag_line: server.tag_line,
        image_url: server.image_url,
        image_url: server.image_url,
        members: server.members,
        createdAt: server.createdAt,
        updatedAt: server.updatedAt,
        message: sortedMessage,
      });
    })
  );

  const sortedServers = serversInUser.map((data) => {
    const server = servers.find(
      (s) => s._id.toString() === data._id.toString()
    );
    return server;
  });

  // const newServer = [];
  // sortedServers.map( (data) => {
  //   // serverMessage =

  //   newServer.push({
  //     "_id" : data._id,
  //     "name" : data.name,
  //     "description" : data.description,
  //     "tag_line" : data.tag_line,
  //     "image_url" : data.image_url,
  //     "image_url" : data.image_url,
  //     "members" : data.members,
  //     "createdAt" : data.createdAt,
  //     "updatedAt" : data.updatedAt,
  //     "message" : []
  //   })
  // })

  // const sortedMessage = newMessage.map((d) => {
  //   const mes = newMessage.find(
  //     (s) => s._id.toString() === d._id.toString()
  //   );
  //   return mes;
  // });

  res.json({
    user_id: user._id,
    user_name: user.username,
    user_image: user.image_url,
    server_data: sortedServers,
  });
};

exports.updateReadedMessage = async (req, res) => {
  const payload = req.payload;
  const { server_id } = req.body;

  const user = await User.findOne({ _id: payload.id });

  const readedData = {
    user_id: payload.id,
    user_name: user.username,
  };

  // Temukan pesan yang cocok dengan server_id dan belum memiliki user_id yang sama
  const messagesToUpdate = await ServerMessage.find({
    server_id: server_id,
    "readed.user_id": { $ne: payload.id }, // Pastikan tidak ada user_id yang sama
  });

  // Update setiap pesan dengan menambahkan readedData ke dalam array readed
  const updatePromises = messagesToUpdate.map(async (message) => {
    message.readed.push(readedData);
    await message.save();
  });

  await Promise.all(updatePromises);

  res.json({
    message: "Successfully readed all message",
  });
};
