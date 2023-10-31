const router = require('express').Router();
const {catchErrors} = require("../handlers/errorHandler");
const serverroomController = require("../controllers/serverroomController");

const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Images");
  },

  filename: (req, file, cb) => {
    const payload = req.payload;
    const extname = path.extname(file.originalname); 
    console.log(payload);
    cb(null, "server_" + payload.id + ".jpg");
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const extname = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extname)) {
      cb(null, true); // Izinkan pengunggahan jika ekstensi file valid
    } else {
      cb(new Error("Invalid file format"), false); // Tolak pengunggahan jika ekstensi file tidak valid
    }
  },
});
const auth = require("../middlewares/auth")

router.get("/", auth, catchErrors(serverroomController.getAllServerRoomByPerUser));
router.get("/display/:fileName", catchErrors(serverroomController.getDisplayImage)); //saya ingin ketika user mengakses url ini, akan merenderkan sebuah image
router.get("/discover", auth, catchErrors(serverroomController.getAllServerRoom));

router.post("/create", auth, upload.single('Image'), catchErrors(serverroomController.createServerRoom));

router.post("/leave", auth, catchErrors(serverroomController.leaveServerRoom));
router.post("/member", auth, catchErrors(serverroomController.getServerMember));
router.post("/join", auth, catchErrors(serverroomController.joinServer));

module.exports = router;