const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const upload = require('../middleware/multer');
const router = express.Router();

router.post("/send", authMiddleware, checkPermission("text_chat"),upload.single('file'),sendMessage);
router.get("/messages", authMiddleware,checkPermission("view_chat") ,getMessages);

module.exports = router;
