
const express = require('express');
const { createGroup, getGroupMessages, addGroupMember,sendGroupMessage,getGroups,getGroupDetails} = require('../controllers/groupController');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authMiddleware, createGroup);
router.post('/:groupId/add-member', authMiddleware, addGroupMember);
router.get('/userGroups',authMiddleware,getGroups);
router.post('/send',authMiddleware,sendGroupMessage);
router.get('/:groupId',authMiddleware,getGroupDetails);
router.get('/:groupId/messages', authMiddleware, getGroupMessages);
module.exports = router;
