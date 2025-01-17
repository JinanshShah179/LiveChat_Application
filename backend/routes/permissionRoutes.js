const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const {getPermissions,updatePermissions,getPermissions2} = require('../controllers/permissionController');
const router = express.Router();

router.post("/permissions/update",authMiddleware,updatePermissions);
router.get("/permissions",authMiddleware,getPermissions2);
router.post("/permissions",authMiddleware,getPermissions);

module.exports=router;

