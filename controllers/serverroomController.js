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
    members: [
      {
        _id: payload.id,
      },
    ],
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
    // throw "This server has more than one member, so it cannot be deleted.";

    await ServerRoom.updateOne(
      {
        _id: server_id,
      },
      {
        $pull: {
          members: {
            _id: payload._id, //jika ingin mengkick, tinggal ganti menjadi id si user
          },
        },
      }
    );

    //update on user collection
    await User.updateMany(
      {
        _id: {
          $in: usersOnThisServer.map((user) => user._id),
        },
      },
      {
        $pull: {
          servers: {
            _id: server_id,
          },
        },
      }
    );

    res.json({
      message: "You Successfully Leave Server",
      tes: usersOnThisServer,
    });
  } else {
    //update on user collection
    await User.updateMany(
      {
        _id: {
          $in: usersOnThisServer.map((user) => user._id),
        },
      },
      {
        $pull: {
          servers: {
            _id: server_id,
          },
        },
      }
    );

    // Hapus server dari koleksi ServerRoom
    await ServerRoom.deleteOne({ _id: server_id });

    res.json({
      message: "You Successfully Delete Server",
      tes: usersOnThisServer,
    });
  }
};

exports.getServerMember = async (req, res) => {
  const payload = req.payload;
  const { server_id } = req.body;

  if (!server_id) throw "server id required";

  const findServer = await ServerRoom.findOne({ _id: server_id });
  if (!findServer) throw "Server Id " + server_id + " Not Found";
  const Members = [];
  await Promise.all(
    findServer.members.map(async (row) => {
      const user = await User.findOne({ _id: row._id }).select(
        "-servers -password  -email -createdAt -updatedAt"
      );

      try {
        const memberRole = findServer.members.find(
          (member) => member._id === row._id
        );
        Members.push({ user, role: memberRole.role });
      } catch (error) {
        throw error;
      }
    })
  );
  // const usersOnThisServer = await User.find({ "servers._id": server_id });

  res.json({
    // ServerData: findServer,
    Members: Members,
  });
};

exports.joinServer = async (req, res) => {
  const payload = req.payload;
  const { server_id } = req.body;

  if (!server_id) throw "server id required";

  if (!server_id || !/^[0-9a-fA-F]{24}$/.test(server_id)) {
    return res.status(400).json({ error: "Invalid server id format" });
  }

  const findServer = await ServerRoom.findOne({ _id: server_id });
  if (!findServer) throw "Server not found";

  //check user already join
  const isUserMember = findServer.members.some(member => member._id === payload.id);
  if(isUserMember) throw "You already joined this server"


  //UPDATE TO SERVERROOM
  const newMember = {
    _id: payload.id, // ID user yang bergabung
    role: "Member", // Atur peran sesuai kebutuhan
  };
  const updatedServer = await ServerRoom.findOneAndUpdate(
    { _id: server_id },
    { $push: { members: newMember } }, // Menambahkan anggota ke dalam array 'members'
    { new: true } // Opsi 'new' untuk mengembalikan dokumen yang telah diperbarui
  );

  if (!updatedServer) {
    throw "Failed to update server with new member";
  }


  //UPDATE TO USER
  const newServer = {
    _id: server_id,
    name: updatedServer.name
  }
  const updatedUser = await User.findOneAndUpdate({
    _id : payload.id
  },
  {
    $push: {servers: newServer }
  })

  if (!updatedServer) {
    throw "Failed to join server";
  }

  res.json({
    message: "Successfully joined server",
    server: updatedServer,
  });
};
