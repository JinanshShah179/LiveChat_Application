const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    fromUserId: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      // required:true,
    },
    message: 
    { 
      type: String, 
      required: true 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
