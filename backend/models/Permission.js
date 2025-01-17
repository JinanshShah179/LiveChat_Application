const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["admin", "user", "guest", "host"],
    required: true,
  },
  permissions: {
    view_chat: { type: Boolean, default: false },
    text_chat: { type: Boolean, default: false },
    add_member: { type: Boolean, default: false },
    delete_group: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model("Permission", permissionSchema);
