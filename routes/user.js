const router = require('express').Router();
const {catchErrors} = require("../handlers/errorHandler");
const userController = require("../controllers/userController");

const auth = require("../middlewares/auth")

router.get("/", catchErrors(userController.getAllUser));
router.post("/login", catchErrors(userController.login));
router.post("/register", catchErrors(userController.register));
router.post("/logout", auth, catchErrors(userController.logout));

module.exports = router;