const Group = require("../models/Group");
const Message = require("../models/Message");
const User = require("../models/User");

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
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(userId)) {
      return res
        .status(404)
        .json({ message: "User is already a memeber of group" });
    }
    group.members.push(userId);
    await group.save();
    res.status(200).json({ success: true, group });
  } catch (error) {
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
      },
    });
  } catch (error) {
    console.log("Error in fetchingGroupDetails:", error.message);
    res.status(500).json({ success: false, message: "Error fetching groups" });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  console.log("Delete group called", userId, groupId);
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    if (group.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this group,",
      });
    }
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
