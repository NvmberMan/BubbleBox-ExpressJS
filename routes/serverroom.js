const router = require('express').Router();
const {catchErrors} = require("../handlers/errorHandler");
const serverroomController = require("../controllers/serverroomController");

const auth = require("../middlewares/auth")

router.get("/", auth, catchErrors(serverroomController.getAllServerRoomByPerUser));
router.get("/discover", auth, catchErrors(serverroomController.getAllServerRoom));
router.post("/create", auth, catchErrors(serverroomController.createServerRoom));
router.post("/leave", auth, catchErrors(serverroomController.leaveServerRoom));
router.post("/member", auth, catchErrors(serverroomController.getServerMember));
router.post("/join", auth, catchErrors(serverroomController.joinServer));

module.exports = router;