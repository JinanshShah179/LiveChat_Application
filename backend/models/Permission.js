const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "user", "guest", "host"],
    required: true,
  },
  permissions: {
    view_chat: { type: Boolean, default: false,required:true },
    text_chat: { type: Boolean, default: false ,required:true },
    add_member: { type: Boolean, default: false ,required:true },
    delete_group: { type: Boolean, default: false ,required:true },
  },
});

module.exports = mongoose.model("Permission", permissionSchema);
