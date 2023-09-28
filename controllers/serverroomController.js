const mongoose = require("mongoose");
const ServerRoom = mongoose.model("ServerRoom");
const User = mongoose.model("User");
const ServerMessage = mongoose.model("ServerMessage");

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

  const sortedServers = serversInUser.map((data) => {
    const server = servers.find(
      (s) => s._id.toString() === data._id.toString()
    );
    return server;
  });

  res.json({
    user_id: user._id,
    user_name: user.username,
    user_image: user.image_url,
    server_data: sortedServers,
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
  user.servers.unshift({
    _id: newServerRoomId,
    name: name,
  });

  // Menyimpan perubahan pada dokumen pengguna
  await user.save();




  let newServer = {};
 
  newServer = {
    _id: serverroom._id,
    name: serverroom.name,
    description: serverroom.description,
    tag_line: serverroom.tag_line,
    image_url: serverroom.image_url,
    message: [],
  };



  res.json({
    message: "Serverroom created!",
    data: newServer,
  });
};

exports.leaveServerRoom = async (req, res) => {
  const payload = req.payload;
  const { server_id } = req.body;

  //CHECKING FRONTEND SENDING SERVER_ID BODY
  if (!server_id) throw "server id required";

  //CHEKING IF SERVER IS FOUND IN DATABASE
  const findServer = await ServerRoom.findOne({ _id: server_id });
  if (!findServer) throw "Server Id " + server_id + " Not Found";

  //GETTING ALL USER INT THIS SERVER
  const usersOnThisServer = await User.find({ "servers._id": server_id });

  //CHECK IF USER MORE THAN 1 = LEAVE SERVER | KEEP SERVER
  if (usersOnThisServer.length > 1) {
    //CHEKING OWNERSHIP
    const roleUser = findServer.members.find((u) => u._id === payload.id);

    //CHECK IF THIS USER IS OWNER, CHANGE ANTOHER MEMBER TO OWNER
    if (roleUser.role === "Owner") {
      //GETTING RANDOM MEMBER AND SET ROLE TO OWNER
      const newOwner = findServer.members.find((u) => u._id !== payload.id);
      newOwner.role = "Owner";

      //SET "MEMBERS COLLECTION" IN SERVERROOM DATABASE | CHANGING MEMBER ROLE
      await ServerRoom.findOneAndUpdate(
        {
          _id: server_id, //FIND SERVER WITH SERVER_ID
          "members._id": newOwner._id, //FIND MEMBERS ID WITH NEWOWNER ID
        },
        {
          $set: { "members.$.role": newOwner.role }, // UPDATE FOUNDED MEMBER, AND SET THE ROLE WITH OWNER
        },
        { new: true }
      );
    }

    //AFTER CHEKING OH THE TOP
    //REMOVE THIS MEMBER IN SERVERROOM DATABASE ON MEMBERS COLLECTION
    await ServerRoom.findOneAndUpdate(
      {
        _id: server_id,
      },
      {
        $pull: {
          members: {
            _id: payload.id,
          },
        },
      }
    );

    //DONT FORGET REMOVE TOO IN USER DATABASE ON SERVERS COLLECTION
    await User.findOneAndUpdate(
      {
        _id: payload.id,
      },
      {
        $pull: {
          servers: {
            _id: server_id,
          },
        },
      }
    );

    //RESPONSE TO FRONTEND
    res.json({
      message: "You Successfully Leave Server",
      tes: usersOnThisServer,
    });
  } else {
    //IF MEMBER ONLY 1 PERSON AND YOU THE "OWNER"

    //REMOVING "SERVERS COLLECTION ARRAY" ON USER DATABASE
    await User.findOneAndUpdate(
      {
        _id: payload.id,
      },
      {
        $pull: {
          servers: {
            _id: server_id,
          },
        },
      }
    );

    //DELETE ALL MESSAGE "BECAUSE WANT TO DELETE"
    await ServerMessage.deleteMany({ server_id: server_id });

    //DELETE SERVERROOM
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
  const isUserMember = findServer.members.some(
    (member) => member._id === payload.id
  );
  if (isUserMember) throw "You already joined this server";

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
  const newServerToUser = {
    _id: server_id,
    name: updatedServer.name,
  };
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: payload.id,
    },
    {
      $push: { servers: newServerToUser },
    }
  );

  if (!updatedServer) {
    throw "Failed to join server";
  }

  let newServer = {};
  let newMessage = [];
  let serverJoinedMessage = await ServerMessage.find({ server_id: server_id });
  if (!serverJoinedMessage) {
    serverJoinedMessage = [];
  }

  //GETTING MESSAGE
  await Promise.all(
    serverJoinedMessage.map(async (m) => {
      const userMessage = await User.findOne({ _id: m.user_id }).select(
        "-email -password -createdAt -updatedAt -servers -status -__v"
      );
      newMessage.push({
        _id: m._id,
        user_id: userMessage._id,
        user_name: userMessage.username,
        user_image: userMessage.image_url,
        message: m.message,
      });
    })
  );

  const sortedMessage = serverJoinedMessage.map((d) => {
    const mes = newMessage.find(
      (s) => s._id.toString() === d._id.toString()
    );
    return mes;
  });

  newServer = {
    _id: updatedServer._id,
    name: updatedServer.name,
    description: updatedServer.description,
    tag_line: updatedServer.tag_line,
    image_url: updatedServer.image_url,
    message: sortedMessage,
  };

  res.json({
    message: "Successfully joined server",
    server: newServer,
  });
};
