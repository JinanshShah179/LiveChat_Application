const Message = require("../models/Message");
const User = require("../models/User");
// const Permission = require('../models/Permission');


exports.sendMessage = async (req, res) => {
  const { fromUserId, toUserId, message } = req.body;

  if (!fromUserId || !toUserId || !message) 
  {
    console.error("Invalid message payload:", req.body);  
    return res.status(400).json({ message: "All fields are required" });
  }

  try 
  {
    const newMessage = await Message.create({fromUserId,toUserId,message,});
    const sender = await User.findById(fromUserId).populate("permissions");
    const canSendMessages = sender.permissions.text_chat;
    console.log({canSendMessages})
    const receiver = await User.findById(toUserId);
    res.status(201).json(
      { 
        success: true, 
        data: newMessage,
        sender:{
          _id : sender._id,
          name : sender.name,
          email:sender.email,
          profilePhoto:sender.profilePhoto || null
        },
        receiver: {
          _id: receiver._id,
          name: receiver.name,
          email: receiver.email,
          profilePhoto: receiver.profilePhoto || null,
        },
        canSendMessages,
     });
  } 
  catch (error) 
  {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  const { toUserId } = req.query;
  const { userId } = req; 

  // console.log(toUserId,userId);

  if (!toUserId) 
  {
    return res.status(400).json({ message: "toUserId is required" });
  }

  try 
  {
    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId },
        { fromUserId: toUserId, toUserId: userId },
      ],
    }).sort({ createdAt: 1 });

    const sender = await User.findById(userId);
    const receiver = await User.findById(toUserId);

    res.status(200).json(
      {
      messages,
      sender: {
        _id: sender._id,
        name: sender.name,
        email: sender.email,
        profilePhoto: sender.profilePhoto || null,
      },
      receiver: {
        _id: receiver._id,
        name: receiver.name,
        email: receiver.email,
        profilePhoto: receiver.profilePhoto || null,
      },
    });
  } 
  catch (err) 
  {
    console.log(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};
