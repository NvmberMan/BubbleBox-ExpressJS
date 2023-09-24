require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect("mongodb://tohpati:tohpati@localhost:27018/?authMechanism=DEFAULT", {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
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


mongoose.connection.on('error', (err) => {
    console.log("mongoose connection error: " + err.message)
})

mongoose.connection.once('open', () => {
    console.log("MongoDB Connected!")
})

//bring the model
require('./models/ServerMessage');
require('./models/ServerRoom');
require('./models/User');
require('./models/TokenBlackList');


const app = require("./app");

app.listen(3001, ()=> {
    console.log("Server listening on port 3000")
});