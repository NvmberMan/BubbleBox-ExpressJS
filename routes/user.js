const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandler");
const userController = require("../controllers/userController");

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
    cb(null, "user_" + payload.id + ".jpg");
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
const auth = require("../middlewares/auth");

router.get("/", catchErrors(userController.getAllUser));
router.get("/profil/:fileName", catchErrors(userController.getProfilImage)); //saya ingin ketika user mengakses url ini, akan merenderkan sebuah image

router.put("/profil", auth, upload.single('Image'), catchErrors(userController.updateUserProfil));

router.post("/login", catchErrors(userController.login));
router.post("/register", catchErrors(userController.register));
router.post("/logout", auth, catchErrors(userController.logout));
router.post("/logout", auth, catchErrors(userController.logout));

module.exports = router;
