const mongoose = require("mongoose");
const jwt = require("jwt-then");
const TokenBlackList = mongoose.model("TokenBlackList");

module.exports = async (req, res, next) => {
    try {
        if (!req.headers.authorization) throw "Forbidden!!";
        const token = req.headers.authorization.split(" ")[1];

        // Periksa apakah token ada dalam daftar hitam
        const isBlacklisted = await TokenBlackList.findOne({ token });

        if (isBlacklisted) {
            // Jika token ada dalam daftar hitam, tolak permintaan
            throw "Token has been blacklisted";
        }

        const payload = await jwt.verify(token, process.env.SECRET);

        req.payload = payload;

        next();
    } catch (err) {
        res.status(401).json({
            message: "Forbidden: " + err,
        });
    }

}