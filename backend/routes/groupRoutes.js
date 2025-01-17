
const express = require('express');
const { createGroup, getGroupMessages, addGroupMember,sendGroupMessage,getGroups,getGroupDetails,deleteGroup} = require('../controllers/groupController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const router = express.Router();


router.post('/create', authMiddleware, createGroup);
router.get('/userGroups',authMiddleware,getGroups);
router.get('/:groupId',authMiddleware,getGroupDetails);

router.post('/send',authMiddleware,checkPermission("text_chat"),sendGroupMessage);
router.get('/:groupId/messages', authMiddleware,checkPermission("view_chat") ,getGroupMessages);
router.post('/:groupId/add-member', authMiddleware,checkPermission("add_member"),addGroupMember);
// router.post('/:groupId/add-member', authMiddleware,addGroupMember);
router.delete('/:groupId',authMiddleware,checkPermission("delete_group"),deleteGroup);
module.exports = router;