const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const {getPermissions,updatePermissions} = require('../controllers/permissionController');
const router = express.Router();

router.post("/permissions/update",authMiddleware,updatePermissions);
router.get("/permissions",authMiddleware,getPermissions);

module.exports=router;

