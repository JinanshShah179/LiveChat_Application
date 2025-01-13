const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
      },
    ],
    // admins: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User', // Reference to User model for admin users
    //     required: true,
    //   },
    // ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model who created the group
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Group', groupSchema);
