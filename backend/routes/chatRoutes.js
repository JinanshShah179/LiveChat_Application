const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { checkPermission } = require("../middleware/permissionMiddleware");
const router = express.Router();

router.post("/send", authMiddleware, checkPermission("text_chat"),sendMessage);
// router.post("/send", authMiddleware, sendMessage);
// router.post('group/send',authMiddleware,sendGroupMessage);
router.get("/messages", authMiddleware,checkPermission("view_chat") ,getMessages);
// router.get("/messages", authMiddleware,getMessages);

module.exports = router;
