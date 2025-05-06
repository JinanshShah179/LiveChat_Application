const express = require("express");
const {
  getUsers,
  updateProfilePhoto,
  updateUserProfile,
  getUserProfile,
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const router = express.Router();

router.get("/users", authMiddleware, getUsers);
// router.post('/profile', authMiddleware, upload.single('profilePhoto'), updateProfilePhoto);
router.get("/profile", authMiddleware, getUserProfile);
router.post(
  "/profile",
  authMiddleware,
  upload.single("profilePhoto"),
  updateUserProfile
);

module.exports = router;
