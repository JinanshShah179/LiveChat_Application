const express = require("express");
const {
  signup,
  login,
  adminCreateUser,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/admin/create-user", adminCreateUser);

module.exports = router;
