const express = require('express');
const { createGroup, getGroupMessages, addGroupMember,sendGroupMessage,getGroups,getGroupDetails,deleteGroup,removeGroupMember} = require('../controllers/groupController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');
const upload = require('../middleware/multer');

const router = express.Router();


router.post('/create', authMiddleware, createGroup);
router.get('/userGroups',authMiddleware,getGroups);
router.get('/:groupId',authMiddleware,getGroupDetails);
router.post('/:groupId/remove-member',authMiddleware,removeGroupMember);

router.post('/send',authMiddleware,checkPermission("text_chat"),upload.single('file'),sendGroupMessage);
router.get('/:groupId/messages', authMiddleware,checkPermission("view_chat") ,getGroupMessages);
router.post('/:groupId/add-member', authMiddleware,checkPermission("add_member"),addGroupMember);
// router.post('/:groupId/add-member', authMiddleware,addGroupMember);
router.delete('/:groupId',authMiddleware,checkPermission("delete_group"),deleteGroup);
module.exports = router;