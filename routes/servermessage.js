const router = require('express').Router();
const {catchErrors} = require("../handlers/errorHandler");
const servermessageController = require("../controllers/servermessageController");

const auth = require("../middlewares/auth")

router.post("/send", auth, catchErrors(servermessageController.sendMessage));
router.get("/data", auth, catchErrors(servermessageController.getAllData));

module.exports = router;