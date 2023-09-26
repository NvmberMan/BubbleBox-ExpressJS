require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://tohpati:tohpati@localhost:27018/?authMechanism=DEFAULT",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);
// mongoose.connect("mongodb://tohpati:tohpati@127.0.0.1:27018/bubblebox?authMechanism=DEFAULT", {
//         useUnifiedTopology: true,
//     useNewUrlParser: true
// });
// mongoose.connect("mongodb://tohpati:tohpati@localhost:27018/bubblebox", {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// });
// mongoose.connect("mongodb://tohpati:tohpati@localhost:27018/bubblebox?authMechanism=DEFAULT", {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// });

mongoose.connection.on("error", (err) => {
  console.log("mongoose connection error: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

//bring the model
require("./models/ServerMessage");
require("./models/ServerRoom");
require("./models/User");
require("./models/TokenBlackList");

const http = require("http"); // Pindahkan ini ke atas

const app = require("./app");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server , {
    cors: {
      origin: '*',
    }
  });

const jwt = require("jwt-then");
const TokenBlackList = mongoose.model("TokenBlackList");
const User = mongoose.model("User");

io.use( async (socket, next) => {
const token = socket.handshake.query.token;

try {
    // Periksa apakah token ada dalam daftar hitam
    const isBlacklisted = await TokenBlackList.findOne({ token });

    if (isBlacklisted) {
        // Jika token ada dalam daftar hitam, tolak permintaan
        throw "Token has been blacklisted";
    }

    const payload = await jwt.verify(token, process.env.SECRET);
    socket.userId = payload.id;

    next();
    } catch (err) { }

});

io.on("connection", async (socket) => {
  const user = await User.findOne({"_id": socket.userId});
  console.log("Connected: " + user.username);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + user.username);
  });

  socket.on("joinRoom", ({serverRoomId}) => {
    console.log("someone join " + serverRoomId)
    socket.join(serverRoomId);
  })
  socket.on("leaveRoom", ({serverRoomId}) => {
    console.log("someone leave " + serverRoomId)
    socket.leave(serverRoomId);
  })

  socket.on("sendMessage", ({serverRoomId, message}) => {
    socket.broadcast.to(serverRoomId).emit("newMessage", {
      user_id: socket.userId,
      user_name: user.username,
      user_image: user.image_url,
      message: message
    });
    console.log("New Message :" + message)
  });
});

server.listen(3001, () => {
  console.log("Server listening on port 3000");
});
