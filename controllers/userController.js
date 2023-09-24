const mongoose = require("mongoose");
const User = mongoose.model("User");
const TokenBlackList = mongoose.model("TokenBlackList");
const sha256 = require("js-sha256");
const jwt = require("jwt-then");


exports.getAllUser = async (req, res) => {
    const users = await User.find();

    // const usersWithoutPassword = users.map(user => ({
    //     id: user.id,
    //     username: user.username,
    //     email: user.email,
    //   }));

    res.json({
        message: "Successfully get all server room",
        data: users
    })
}

exports.login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email, password: sha256(password + process.env.SALT)})

    if(!user) throw "Email and Password did not match.";

    const token = await jwt.sign({id: user.id}, process.env.SECRET);

    // return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
    //     expiresIn: '20m',
    //   });

    res.json({
        message: "User logged in successfully!",
        token: token
    })
}

exports.register = async (req, res) => {
    const {username, email, password, repassword, checkbox} = req.body;

    if(!username) throw "Username field cannot be empty.";

    
    const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|live.com]/;
    if(!emailRegex.test(email)) throw "Email is not supported from your domain.";
    
    //find user
    const userExists = await User.findOne({email})
    if(userExists) throw "User with same email already exits.";


    if(password.length < 6) throw "Password must be atleast 7 characters long.";

    if(password != repassword) throw "Password is did not match.";

    if(!checkbox) throw "Please check the police below.";

    const user = new User({username, email, password: sha256(password + process.env.SALT)});

    await user.save();

    res.json({
        message: `User [${username}] registered successfully`
    });
};



exports.logout = async (req, res) => {
    // Di sini, Anda dapat menambahkan token yang akan dinonaktifkan ke daftar hitam (blacklist).
    // Misalnya, Anda memiliki model TokenBlacklist yang berisi token-token yang sudah dinonaktifkan.
  
    const tokenToBlacklist = req.headers.authorization.split(" ")[1];
  
    // Simpan token ke dalam daftar hitam (blacklist)
    const blacklistToken = new TokenBlackList({ token: tokenToBlacklist });
    await blacklistToken.save();
  
    res.json({
      message: "User logged out successfully",
    });
  };
  