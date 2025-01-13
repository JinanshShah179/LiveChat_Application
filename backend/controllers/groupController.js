const Group = require('../models/Group');
const Message = require('../models/Message');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  const { name, members,createdBy  } = req.body;

  if (!name || !members || !createdBy || members.length === 0) {
    return res.status(400).json({ message: 'Group name and members are required.' });
  }

  try {
    const group = await Group.create({ 
      name, 
      members:[...members,createdBy], 
      // admins: [req.userId],
      createdBy,
    });
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// exports.getGroupMessages = async (req, res) => {
//   const { groupId } = req.params;

//   try {
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

//     const messages = await Message.find({ groupId }).sort({ createdAt: 1 }).populate('fromUserId', 'name email profilePhoto');
//     res.status(200).json({ success: true, messages });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Fetch messages for the correct groupId
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .populate('fromUserId', 'name email profilePhoto'); // Populate sender details
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addGroupMember = async (req, res) => {
  const { groupId } = req.params;
  const { memberId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (!group.members.includes(memberId)) {
      group.members.push(memberId);
      await group.save();
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendGroupMessage = async (req, res) => {
    const { fromUserId, groupId, message } = req.body;

    console.log("Hello from group");
  
    if (!fromUserId || !groupId || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
  
    try {
      // const group = await Group.findById(groupId);
      // if (!group) {
      //   return res.status(404).json({ success: false, message: 'Group not found' });
      // }

      // Create the message
      const newMessage = await Message.create({
        fromUserId,
        groupId,
        message,
      });
  
      res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error sending group message.' });
    }
  };

exports.getGroups = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated and userId is available
    const groups = await Group.find({ members: userId }).populate('createdBy','name email'); // Fetch groups where the user is a member
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
};

exports.getGroupDetails = async (req,res) =>{
  const {groupId} = req.params;

  try {
    const group = await Group.findById(groupId)
    .populate('members','name email profilePhoto')
    .populate('createdBy','name email profilePhoto');
    if(!group)
    {
      return res.status(404).json({success:false,message:"Group not found"});
    }
    res.status(200).json({
      success:true,
      group:{
        id:group._id,
        name:group.name
      }
    });
  } catch (error) {
    console.log("Error in fetchingGroupDetails:",error.message);
    res.status(500).json({ success:false,message: 'Error fetching groups' });
  }
}