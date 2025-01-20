const Group = require("../models/Group");
const Message = require("../models/Message");
const User = require("../models/User");
const Permission = require('../models/Permission');

exports.createGroup = async (req, res) => {
  const { name, members, createdBy } = req.body;

  // console.log("Create group called");

  if (!name || !members || !createdBy || members.length === 0) {
    return res
      .status(400)
      .json({ message: "Group name and members are required." });
  }

  try {
    const group = await Group.create({
      name,
      members: [...members, createdBy],
      // admins: [req.userId],
      createdBy,
    });
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 })
      .populate("fromUserId", "name email profilePhoto");
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.addGroupMember = async (req, res) => {
  const { groupId } = req.params;
  const { userIds } = req.body;

  try {

    if(!Array.isArray(userIds) || userIds.length === 0)
    {
      return res.status(400).json({message:"Provide an array of user Ids"});
    }

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });  

    const newMembers = userIds.filter((userId) => !group.members.includes(userId));

    if(newMembers.length === 0)
    {
       return res.status(400).json({message:"All users are already in the group"});
    }

    //logic of adding single userId
    // if (group.members.includes(userId)) {
    //   return res
    //     .status(404)
    //     .json({ message: "User is already a memeber of group" });
    // }

    group.members.push(...newMembers);
    await group.save();
    res.status(200).json({ success: true, message:"Users added to the group Succesfully.",group });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeGroupMember = async (req,res)=>{

  const {groupId } = req.params;
  const {userId} = req.body;

  try 
  {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });  

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });  

    const isMember = group.members.some((member) => member.equals(userId));
    if(!isMember) return res.status(404).json({success:false,message:"User is not a member of Group"});

    group.members = group.members.filter((member) => !member.equals(userId));
    await group.save();

    res.status(200).json({message:"User removed from the group Succesfully"});
  }
  catch (error) 
  {
   res.status(500).json({ success: false, error: error.message });   
  }
};


exports.sendGroupMessage = async (req, res) => {
  const { fromUserId, groupId, message } = req.body;

  // console.log("Hello from group");

  if (!fromUserId || !groupId || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // Create the message
    const newMessage = await Message.create({
      fromUserId,
      groupId,
      message,
    });

    const populatedMessage = await newMessage.populate(
      "fromUserId",
      "name email profilePhoto"
    );
    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error sending group message." });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId }).populate(
      "createdBy",
      "name email"
    );
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups" });
  }
};

exports.getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId)
      .populate("members", "name email profilePhoto")
      .populate("createdBy", "name email profilePhoto");
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }
    res.status(200).json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        createdBy: group.createdBy,
        members:group.members,
      },
    });
  } catch (error) {
    console.log("Error in fetchingGroupDetails:", error.message);
    res.status(500).json({ success: false, message: "Error fetching groups" });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id; // Assumes middleware has set req.user
  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    // Fetch the user and their permissions
    const user = await User.findById(userId).populate("permissions");
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: User not found." });
    }

    const { role, permissions } = user;

    // Check if user is allowed to delete the group
    const canDeleteGroup =
      group.createdBy.toString() === userId || // User is the creator
      role === "admin" || // User is an admin
      (permissions && permissions.permissions.delete_group); // User has explicit permission

    if (!canDeleteGroup) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this group.",
      });
    }

    // Delete the group and related messages
    await Group.findByIdAndDelete(groupId);
    await Message.deleteMany({ groupId });

    res
      .status(200)
      .json({ success: true, message: "Group deleted successfully." });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ success: false, message: "Error deleting group." });
  }
};
